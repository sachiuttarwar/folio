from dotenv import load_dotenv
load_dotenv()

import os, json, uuid, sqlite3, re
from datetime import datetime
from pathlib import Path
from typing import Optional, List
import anthropic
import yfinance as yf
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Folio", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
DB_PATH = "alphalens.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY, company_name TEXT NOT NULL, ticker TEXT NOT NULL,
        industry TEXT, peers TEXT, perspective TEXT, depth TEXT,
        documents TEXT, report_json TEXT NOT NULL, created_at TEXT NOT NULL)""")
    conn.commit()
    conn.close()

init_db()

class ReportRequest(BaseModel):
    company_name: str
    ticker: str
    industry: Optional[str] = ""
    peers: Optional[str] = ""
    perspective: str = "neutral"
    depth: str = "standard"
    document_ids: List[str] = []

def get_financial_data(ticker: str) -> str:
    """Fetch live financial data from Yahoo Finance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        def fmt(val, prefix="$", suffix="", billions=False):
            if val is None: return "N/A"
            if billions: return f"{prefix}{val/1e9:.1f}B{suffix}"
            return f"{prefix}{val}{suffix}"
        def pct(val):
            if val is None: return "N/A"
            return f"{val*100:.1f}%"
        data = f"""
LIVE FINANCIAL DATA (Yahoo Finance):
- Current Price: {fmt(info.get('currentPrice'))}
- Market Cap: {fmt(info.get('marketCap'), billions=True)}
- P/E Ratio (TTM): {fmt(info.get('trailingPE'), prefix="")}
- Forward P/E: {fmt(info.get('forwardPE'), prefix="")}
- EPS (TTM): {fmt(info.get('trailingEps'))}
- Revenue (TTM): {fmt(info.get('totalRevenue'), billions=True)}
- Revenue Growth (YoY): {pct(info.get('revenueGrowth'))}
- Gross Margin: {pct(info.get('grossMargins'))}
- Operating Margin: {pct(info.get('operatingMargins'))}
- Net Margin: {pct(info.get('profitMargins'))}
- Free Cash Flow: {fmt(info.get('freeCashflow'), billions=True)}
- Return on Equity: {pct(info.get('returnOnEquity'))}
- Debt to Equity: {fmt(info.get('debtToEquity'), prefix="")}
- 52-Week High: {fmt(info.get('fiftyTwoWeekHigh'))}
- 52-Week Low: {fmt(info.get('fiftyTwoWeekLow'))}
- Dividend Yield: {pct(info.get('dividendYield'))}
- Beta: {fmt(info.get('beta'), prefix="")}
- Analyst Target Price: {fmt(info.get('targetMeanPrice'))}
- Analyst Recommendation: {info.get('recommendationKey', 'N/A').upper()}
"""
        return data.strip()
    except Exception as e:
        return f"[Financial data unavailable: {e}]"

AUTOFILL_KEYWORDS = [
    "business overview","company overview","about the company","our business","overview",
    "industry","market overview","competition","competitive","competitors",
    "products and services","our products","revenue","segments",
]

AUTOFILL_PRIORITY = [
    "business overview","our business","company overview","overview",
    "products and services","industry","market overview",
    "competition","competitive landscape","competitors","segments","revenue",
]

SEC_SECTION_PATTERNS = [
    ("business",   [r"item\s+1[\.\s]*business\b", r"^item\s+1\s*$"]),
    ("risks",      [r"item\s+1a[\.\s]*risk factors", r"risk factors\b"]),
    ("mda",        [r"item\s+7[\.\s]*management", r"management.{0,15}discussion and analysis"]),
    ("financials", [r"item\s+8[\.\s]*financial statements", r"financial statements and supplementary"]),
]

SEC_LABELS = {
    "business":   "ITEM 1 — BUSINESS",
    "risks":      "ITEM 1A — RISK FACTORS",
    "mda":        "ITEM 7 — MD&A",
    "financials": "ITEM 8 — FINANCIAL STATEMENTS",
}

def extract_ticker_regex(text):
    match = re.search(r'\b([A-Z]{1,5})\s*\n\s*(NASDAQ|NYSE|Nasdaq)', text)
    if match:
        return match.group(1)
    match = re.search(r'Trading Symbol[s]?[\s\S]{0,100}?([A-Z]{2,5})', text)
    if match:
        t = match.group(1)
        if t not in ('AND','THE','FOR','ACT','SEC','USA','INC','LLC','LTD','FORM'):
            return t
    return ""

def extract_company_name_regex(text):
    match = re.search(r'\n([A-Z][A-Z\s,\.]+(?:CORPORATION|CORP|INC|LLC|LTD|CO\.|COMPANY|GROUP))\s*\n', text)
    if match:
        return match.group(1).strip().title()
    return ""

def extract_smart_sections_autofill(file_path):
    full_text = ""
    try:
        import fitz
        doc = fitz.open(str(file_path))
        for i in range(min(20, len(doc))):
            full_text += doc[i].get_text() + "\n"
        doc.close()
    except Exception:
        return "", ""
    lines = full_text.split("\n")
    sections = {}
    for i, line in enumerate(lines):
        ll = line.lower().strip()
        if not ll:
            continue
        for kw in AUTOFILL_KEYWORDS:
            if kw in ll and len(ll) < 100:
                end = min(i + 35, len(lines))
                snippet = "\n".join(lines[i:end]).strip()
                if kw not in sections or len(snippet) > len(sections[kw]):
                    sections[kw] = snippet
                break
    focused = ""
    seen = set()
    for kw in AUTOFILL_PRIORITY:
        if kw in sections and kw not in seen:
            focused += f"\n\n=== {kw.upper()} ===\n{sections[kw]}"
            seen.add(kw)
    header = full_text[:2000]
    return header, focused

def extract_10k_sections_for_report(file_path):
    try:
        import fitz
        doc = fitz.open(str(file_path))
        full_text = ""
        for page in doc:
            full_text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        return f"[PDF error: {e}]"
    lines = full_text.split("\n")
    section_positions = {}
    for sec_name, patterns in SEC_SECTION_PATTERNS:
        for pattern in patterns:
            for i, line in enumerate(lines):
                ll = line.strip().lower()
                if not ll:
                    continue
                if not (len(ll) < 120 and re.search(pattern, ll)):
                    continue
                if re.search(r'[\.\s]{2,}\d+\s*$', ll):
                    continue
                if any(w in ll for w in ['of this', 'see item', 'part ii,', 'refer to', 'for further', 'for information', 'in item']):
                    continue
                next_lines = [lines[j].strip() for j in range(i+1, min(i+3, len(lines))) if lines[j].strip()]
                if next_lines and re.match(r'^\d+$', next_lines[0]):
                    continue
                if sec_name not in section_positions:
                    section_positions[sec_name] = i
                    break
            if sec_name in section_positions:
                break
    if not section_positions:
        return full_text[:14000]
    budgets = {"mda": 5000, "risks": 3500, "business": 3000, "financials": 2500}
    section_order = [s[0] for s in SEC_SECTION_PATTERNS]
    context_parts = []
    for idx, sec_name in enumerate(section_order):
        if sec_name not in section_positions:
            continue
        start = section_positions[sec_name]
        end = len(lines)
        for next_sec in section_order[idx+1:]:
            if next_sec in section_positions:
                end = section_positions[next_sec]
                break
        text = "\n".join(lines[start:end]).strip()
        budget = budgets.get(sec_name, 3000)
        if len(text) > budget:
            half = budget // 2
            text = text[:half] + "\n\n[...section continues...]\n\n" + text[-half//2:]
        if text:
            context_parts.append(f"=== {SEC_LABELS[sec_name]} ===\n{text}")
    return "\n\n".join(context_parts) if context_parts else full_text[:14000]

def extract_text(file_path, filename):
    if Path(filename).suffix.lower() == ".pdf":
        return extract_10k_sections_for_report(file_path)
    try:
        return Path(file_path).read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return f"[Error: {e}]"

def chunk_text(text, max_chars=12000):
    if len(text) <= max_chars:
        return text
    half = max_chars // 2
    return text[:half] + "\n\n[...truncated...]\n\n" + text[-half:]

def claude_generate(prompt, system):
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8000,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()

SYSTEM_PROMPT = """You are a senior equity research analyst at a bulge-bracket investment bank.
Produce institutional-quality research using both the provided document sections AND the live financial data.
The live financial data contains real current metrics — use these numbers in your analysis.
Always make a definitive BUY, HOLD, or AVOID recommendation based on the available data.
Return ONLY valid JSON — no markdown, no backticks, no preamble."""

DEPTH_INSTRUCTIONS = {
    "brief":    "Write concise analysis: 3-4 bullets per list, 2-3 sentences per prose section.",
    "standard": "Write thorough analysis: 5-7 bullets per list, 3-5 sentences per prose section.",
    "detailed": "Write comprehensive analysis: 8+ bullets per list, 5-7 sentences with specific data points.",
}

def build_prompt(request, doc_content, financial_data):
    depth_note = DEPTH_INSTRUCTIONS.get(request.depth, DEPTH_INSTRUCTIONS["standard"])
    return f"""Generate a structured equity research report for {request.company_name} ({request.ticker}).

PARAMETERS:
- Industry: {request.industry or 'Not specified'}
- Peers: {request.peers or 'Not specified'}
- Perspective: {request.perspective}
- Depth: {request.depth}

{depth_note}

{financial_data}

DOCUMENT SECTIONS FROM 10-K FILING:
{doc_content if doc_content else "No documents uploaded — base analysis on financial data above."}

Return ONLY this JSON (no backticks):
{{"executiveSummary":["b1","b2","b3","b4","b5"],"companyOverview":"string","financialPerformance":"string","industryPositioning":"string","keyRisks":["r1","r2","r3","r4","r5"],"bullCase":"string","bearCase":"string","baseCase":"string","valuationDiscussion":"string","recommendation":"BUY|HOLD|AVOID","confidence":"LOW|MEDIUM|HIGH","recommendationRationale":"string","investmentSignals":[{{"signal":"string","direction":"positive|negative|neutral","detail":"string"}}],"investmentImplications":"string","financialMetrics":[{{"label":"string","value":"string","trend":"up|down|neutral"}}]}}"""


@app.get("/financials/{ticker}")
def get_financials(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        income = stock.financials
        if income.empty:
            return {"error": "No data"}
        rows = {}
        for idx in income.index:
            rows[idx] = {}
            for col in income.columns:
                val = income.loc[idx, col]
                rows[idx][str(col.date())] = float(val) if val is not None and str(val) != "nan" else None
        return {"financials": rows}
    except Exception as e:
        return {"error": str(e)}


@app.get("/compare/{tickers}")
def compare_peers(tickers: str):
    try:
        ticker_list = [t.strip() for t in tickers.split(",") if t.strip()]
        results = []
        for ticker in ticker_list[:6]:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                def pct(v): return round(v*100, 1) if v is not None else None
                def bil(v): return round(v/1e9, 1) if v is not None else None
                results.append({
                    "ticker": ticker,
                    "name": info.get("shortName", ticker),
                    "marketCap": bil(info.get("marketCap")),
                    "revenue": bil(info.get("totalRevenue")),
                    "revenueGrowth": pct(info.get("revenueGrowth")),
                    "grossMargin": pct(info.get("grossMargins")),
                    "operatingMargin": pct(info.get("operatingMargins")),
                    "peRatio": info.get("trailingPE"),
                    "forwardPE": info.get("forwardPE"),
                    "evRevenue": info.get("enterpriseToRevenue"),
                    "recommendation": info.get("recommendationKey","N/A").upper(),
                })
            except Exception:
                results.append({"ticker": ticker, "name": ticker, "error": True})
        return {"peers": results}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
def health():
    return {"status": "ok", "service": "Folio"}

@app.post("/extract-text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")
    ext = Path(file.filename).suffix.lower()
    if ext not in (".pdf", ".txt", ".md", ".docx"):
        raise HTTPException(status_code=400, detail=f"Unsupported: {ext}")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file.")
    tmp_path = UPLOAD_DIR / f"tmp_{uuid.uuid4()}{ext}"
    tmp_path.write_bytes(content)
    try:
        if ext == ".pdf":
            header, sections = extract_smart_sections_autofill(tmp_path)
            snippet = header + sections
        else:
            raw = Path(tmp_path).read_text(encoding="utf-8", errors="ignore")
            header = raw[:2000]
            snippet = raw[:10000]
            sections = ""
    finally:
        tmp_path.unlink(missing_ok=True)
    if not snippet.strip():
        return {"companyName": "", "ticker": "", "industry": "", "peers": "", "charsExtracted": 0}
    ticker_regex = extract_ticker_regex(header)
    company_regex = extract_company_name_regex(header)
    prompt = f"""Parse this company financial document. Return ONLY valid JSON, no markdown:
{{"companyName":"full legal company name","ticker":"stock ticker symbol","industry":"specific industry or sector","peers":"comma-separated competitor names"}}
Use empty string if not found.
COVER PAGE:
{header[:1500]}
BUSINESS SECTIONS:
{sections[:5000]}"""
    try:
        raw = claude_generate(prompt, "You are parsing a financial document. Return only valid JSON, no markdown.")
        clean = raw.replace("```json","").replace("```","").strip()
        info = json.loads(clean)
    except Exception:
        info = {"companyName": "", "ticker": "", "industry": "", "peers": ""}
    return {
        "companyName": info.get("companyName","") or company_regex,
        "ticker": info.get("ticker","") or ticker_regex,
        "industry": info.get("industry",""),
        "peers": info.get("peers",""),
        "charsExtracted": len(snippet),
    }

@app.post("/upload-documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")
    results = []
    for upload in files:
        if not upload.filename:
            continue
        ext = Path(upload.filename).suffix.lower()
        if ext not in (".pdf",".txt",".md",".docx"):
            raise HTTPException(status_code=400, detail=f"Unsupported: {ext}")
        doc_id = str(uuid.uuid4())
        save_path = UPLOAD_DIR / f"{doc_id}{ext}"
        content = await upload.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file.")
        if len(content) > 100*1024*1024:
            raise HTTPException(status_code=400, detail="File too large.")
        save_path.write_bytes(content)
        results.append({"id": doc_id, "filename": upload.filename, "size_kb": round(len(content)/1024,1), "chars_extracted": 0})
    return {"documents": results}

@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured.")
    
    # Fetch live financial data from Yahoo Finance
    financial_data = get_financial_data(request.ticker)
    
    doc_blocks = []
    for doc_id in request.document_ids:
        matches = list(UPLOAD_DIR.glob(f"{doc_id}.*"))
        if not matches:
            continue
        file_path = matches[0]
        text = extract_text(file_path, file_path.name)
        doc_blocks.append(f"=== {file_path.name} ===\n{chunk_text(text, 10000)}")
    doc_content = "\n\n".join(doc_blocks)
    prompt = build_prompt(request, doc_content, financial_data)
    try:
        raw = claude_generate(prompt, SYSTEM_PROMPT)
        clean = raw.replace("```json","").replace("```","").strip()
        report_data = json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI error: {e}")
    report_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    conn = get_db()
    conn.execute("INSERT INTO reports (id,company_name,ticker,industry,peers,perspective,depth,documents,report_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (report_id, request.company_name, request.ticker, request.industry, request.peers,
         request.perspective, request.depth, json.dumps(request.document_ids), json.dumps(report_data), created_at))
    conn.commit()
    conn.close()
    return {"id": report_id, "company_name": request.company_name, "ticker": request.ticker, "created_at": created_at, "report": report_data}

@app.get("/reports")
def list_reports():
    conn = get_db()
    rows = conn.execute("SELECT id,company_name,ticker,industry,perspective,depth,created_at,report_json FROM reports ORDER BY created_at DESC").fetchall()
    conn.close()
    return {"reports": [{"id":r["id"],"company_name":r["company_name"],"ticker":r["ticker"],"industry":r["industry"],"perspective":r["perspective"],"depth":r["depth"],"created_at":r["created_at"],"recommendation":json.loads(r["report_json"]).get("recommendation","N/A")} for r in rows]}

@app.get("/reports/{report_id}")
def get_report(report_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Not found.")
    return {"id":row["id"],"company_name":row["company_name"],"ticker":row["ticker"],"industry":row["industry"],"peers":row["peers"],"perspective":row["perspective"],"depth":row["depth"],"documents":json.loads(row["documents"]),"created_at":row["created_at"],"report":json.loads(row["report_json"])}

@app.delete("/reports/{report_id}")
def delete_report(report_id: str):
    conn = get_db()
    result = conn.execute("DELETE FROM reports WHERE id=?", (report_id,))
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Not found.")
    return {"deleted": report_id}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# AlphaLens AI

> AI-powered equity research from company filings.

Upload 10-Ks, earnings transcripts, and investor presentations. Get structured, decision-useful equity research in minutes, powered by Claude.

---

## Architecture

```
alphalens-ai/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── requirements.txt
│   └── uploads/         # Auto-created, stores uploaded documents
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── LandingPage.jsx
│   │       ├── UploadPage.jsx
│   │       └── Pages.jsx   # GeneratingPage, ReportPage, HistoryPage
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

---

### 1. Clone & Configure

```bash
git clone <repo-url>
cd alphalens-ai
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
```

The API will start at **http://localhost:8000**

API docs available at: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will open at **http://localhost:5173**

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
```

For the frontend (optional, defaults to localhost:8000):
```env
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload-documents` | Upload PDF/TXT/DOCX files |
| `POST` | `/generate-report` | Generate equity research report |
| `GET` | `/reports` | List all saved reports |
| `GET` | `/reports/{id}` | Get full report by ID |
| `DELETE` | `/reports/{id}` | Delete a report |
| `GET` | `/health` | Health check |

### Example: Generate Report

```bash
# 1. Upload documents
curl -X POST http://localhost:8000/upload-documents \
  -F "files=@apple_10k_2024.pdf"

# 2. Generate report (use doc ID from step 1)
curl -X POST http://localhost:8000/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Apple Inc.",
    "ticker": "AAPL",
    "industry": "Consumer Technology",
    "peers": "MSFT, GOOG, META",
    "perspective": "objective",
    "depth": "standard",
    "document_ids": ["<id-from-upload>"]
  }'
```

---

## Supported Document Types

- **10-K** — Annual report
- **10-Q** — Quarterly report  
- **Earnings Transcript** — Earnings call transcripts
- **Investor Presentation** — Slide decks (as PDF)
- **Annual Report** — Any annual report PDF

Accepted file formats: `.pdf`, `.txt`, `.docx`, `.md`

---

## Report Structure

Generated reports include:

| Section | Content |
|---------|---------|
| A | Executive Summary (5-7 bullets) |
| B | Company Overview |
| C | Financial Performance Analysis |
| D | Industry & Competitive Positioning |
| E | Key Risks |
| F | Bull Case |
| G | Bear Case |
| H | Base Case |
| I | Valuation Discussion |
| J | Investment Memo Conclusion |

---

## Important Notes

- **No synthetic data**: The AI only uses information from uploaded documents
- **Transparent gaps**: Missing data is clearly labeled "Not available in uploaded documents"
- **Document grounding**: All claims are based on uploaded filings
- **SQLite storage**: Reports persist in `alphalens.db` (local file)

---

## Roadmap (Post-MVP)

- [ ] SEC EDGAR direct integration
- [ ] Yahoo Finance / FMP API for live financial data
- [ ] Peer comparison charts (Recharts)
- [ ] PDF export for reports
- [ ] Multi-document cross-reference analysis
- [ ] Streaming report generation
- [ ] User authentication

---

## License

MIT

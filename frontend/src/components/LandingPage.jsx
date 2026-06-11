import { useState } from "react";

export default function LandingPage({ onStart }) {
  const [showWorkflow, setShowWorkflow] = useState(false);
  const steps = [
    { num: "01", title: "Upload Filings", desc: "10-K, 10-Q, transcripts, or presentations" },
    { num: "02", title: "Company Details", desc: "Ticker, industry, research parameters" },
    { num: "03", title: "AI Analysis", desc: "Deep document analysis and synthesis" },
    { num: "04", title: "Research Report", desc: "Full memo with bull, base, and bear cases" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 50px)", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 32, height: 0.5, background: "#ccc" }} />
        Equity Research Intelligence
        <div style={{ width: 32, height: 0.5, background: "#ccc" }} />
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 400, lineHeight: 1.15, color: "#111", maxWidth: 560, marginBottom: 16 }}>
        From filings to<br />investment thesis.
      </h1>
      <p style={{ fontSize: 15, color: "#777", maxWidth: 400, marginBottom: 44, lineHeight: 1.8, fontWeight: 300 }}>
        Upload 10-Ks, earnings transcripts, and investor presentations. Get structured equity research in minutes.
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 72 }}>
        <button onClick={onStart} style={{ background: "#111", color: "#faf8f4", border: "none", padding: "12px 32px", borderRadius: 4, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "0.02em" }}>
          New Report
        </button>
        <button onClick={() => setShowWorkflow(true)} style={{ background: "transparent", color: "#555", border: "0.5px solid #d0ccc4", padding: "12px 32px", borderRadius: 4, fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer", letterSpacing: "0.02em" }}>
          How It Works
        </button>
      </div>

      {showWorkflow && (
        <div onClick={() => setShowWorkflow(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, padding: "44px 48px", maxWidth: 860, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setShowWorkflow(false)} style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", fontSize: 18, color: "#aaa", cursor: "pointer" }}>✕</button>

            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#aaa", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>Folio · Research Infrastructure</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, color: "#111", marginBottom: 40 }}>How It Works</div>

            {/* High-level flow */}
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 44, gap: 0 }}>
              {[
                {
                  num: "01", label: "Upload", sub: "10-K, 10-Q, transcripts",
                  desc: "Upload any SEC filing or earnings document. Folio accepts PDFs, text files, and DOCX. The document is temporarily processed and never stored permanently.",
                  out: "Raw document"
                },
                {
                  num: "02", label: "Extract", sub: "Section keyword matching",
                  desc: "Folio scans the document for key sections — business overview, competition, revenue drivers, risk factors — using keyword matching to locate and extract the most analytically relevant content.",
                  out: "Structured text"
                },
                {
                  num: "03", label: "Enrich", sub: "Yahoo Finance API",
                  desc: "Using the company ticker, Folio pulls live market data: current price, market cap, P/E ratios, margins, free cash flow, 52-week range, analyst targets, and peer financials.",
                  out: "Financial data"
                },
                {
                  num: "04", label: "Analyze", sub: "Claude (Anthropic)",
                  desc: "Claude synthesizes the extracted filing content and live market data into a structured investment thesis — evaluating valuation, competitive positioning, risks, and forming a recommendation.",
                  out: "Investment thesis"
                },
                {
                  num: "05", label: "Report", sub: "Institutional memo",
                  desc: "The output is a comprehensive equity research memo with executive summary, bull/base/bear cases, peer benchmarking, revenue charts, investment signals, and a scored BUY, HOLD, or AVOID rating.",
                  out: "Full report"
                },
              ].map((step, i) => (
                <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: "0 8px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#fff", letterSpacing: "0.06em" }}>{step.num}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 4, textAlign: "center" }}>{step.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#aaa", letterSpacing: "0.04em", lineHeight: 1.5, marginBottom: 10, textAlign: "center" }}>{step.sub}</div>
                    <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7, textAlign: "center", marginBottom: 12 }}>{step.desc}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#fff", background: "#111", padding: "3px 10px", borderRadius: 3, letterSpacing: "0.06em" }}>→ {step.out}</div>
                  </div>
                  {i < 4 && <div style={{ width: 0.5, background: "#eee", alignSelf: "stretch", margin: "0 4px", flexShrink: 0 }} />}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "0.5px solid #eee", paddingTop: 32, marginBottom: 24 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#aaa", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>Data Sources & Outputs</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    tag: "INPUT", tagColor: "#7a5a10", tagBg: "#fdf8ec",
                    label: "SEC Filing (10-K / 10-Q)",
                    items: ["Business overview & competitive landscape", "Risk factors & revenue segments", "Management discussion & analysis", "Key sections extracted by keyword matching"]
                  },
                  {
                    tag: "LIVE", tagColor: "#0f6e56", tagBg: "#e1f5ee",
                    label: "Yahoo Finance (Real-time)",
                    items: ["Price, market cap, P/E, forward P/E", "Revenue growth, margins, FCF, ROE", "52-week range & analyst price targets", "Peer benchmarking across 5+ companies"]
                  },
                  {
                    tag: "PROCESSING", tagColor: "#3a4a7a", tagBg: "#f0f2fa",
                    label: "Claude AI (Anthropic)",
                    items: ["Synthesizes documents into investment thesis", "Generates bull, base & bear case scenarios", "Scores investment signals & recommendation", "Produces BUY, HOLD, or AVOID decision"]
                  },
                  {
                    tag: "OUTPUT", tagColor: "#1a6b3a", tagBg: "#f0f9f4",
                    label: "Investment Report",
                    items: ["Executive summary & financial analysis", "Peer comparison & revenue/margin charts", "Investment signals & valuation discussion", "Investment framework scorecard"]
                  },
                ].map((card) => (
                  <div key={card.label} style={{ background: "#faf8f4", border: "0.5px solid #e8e4dc", borderRadius: 8, padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: card.tagColor, background: card.tagBg, padding: "2px 8px", borderRadius: 3, letterSpacing: "0.08em" }}>{card.tag}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{card.label}</span>
                    </div>
                    {card.items.map((item, i) => (
                      <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#888", lineHeight: 1.8 }}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "10px 14px", background: "#f5f3ef", borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#aaa", lineHeight: 1.6, letterSpacing: "0.04em" }}>
              FOLIO · Reports are AI-generated using uploaded filings and live market data. For informational purposes only.
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, maxWidth: 680, width: "100%", border: "0.5px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ background: "#fff", padding: "20px 18px", borderRight: i < 3 ? "0.5px solid #e8e4dc" : "none", display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#bbb", letterSpacing: "0.08em" }}>{s.num}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.55 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ccc", letterSpacing: "0.08em" }}>
        FOLIO · AI-POWERED FINANCIAL RESEARCH
      </div>
    </div>
  );
}

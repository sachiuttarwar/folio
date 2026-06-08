export default function LandingPage({ onStart, onExample }) {
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
        <button onClick={onExample} style={{ background: "transparent", color: "#888", border: "0.5px solid #d0ccc4", padding: "12px 32px", borderRadius: 4, fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer" }}>
          View Example
        </button>
      </div>
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

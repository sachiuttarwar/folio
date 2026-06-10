import { useRef, useState } from "react";

const PERSPECTIVES = [
  { value: "optimistic", label: "Optimistic", desc: "Looking for reasons to buy" },
  { value: "skeptical", label: "Skeptical", desc: "Looking for reasons to avoid" },
  { value: "balanced", label: "Balanced", desc: "No strong lean either way" },
  { value: "neutral", label: "Neutral", desc: "Pure analysis, no angle" },
];

const DEPTHS = [
  { value: "brief", label: "Brief", desc: "5 min read" },
  { value: "standard", label: "Standard", desc: "Recommended" },
  { value: "detailed", label: "Detailed", desc: "Full analyst depth" },
];

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const S = {
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 },
  input: { background: "#fff", border: "0.5px solid #d8d4cc", color: "#111", fontFamily: "'Inter', sans-serif", fontSize: 14, padding: "10px 14px", borderRadius: 6, outline: "none", width: "100%", boxSizing: "border-box" },
  divider: { border: "none", borderTop: "0.5px solid #e4e0d8", margin: "28px 0" },
};

async function extractCompanyInfo(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/extract-text`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Extraction failed");
  return await res.json();
}

export default function UploadPage({ uploadedFiles, setUploadedFiles, formData, setFormData, onGenerate, error, setError }) {
  const fileInputRef = useRef();
  const [extracting, setExtracting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const addFiles = async (files) => {
    const arr = Array.from(files);
    setUploadedFiles((prev) => {
      const ex = new Set(prev.map(f => f.name));
      return [...prev, ...arr.filter(f => !ex.has(f.name))];
    });
    const firstNew = arr[0];
    if (!firstNew) return;
    setExtracting(true); setAutoFilled(false);
    try {
      const info = await extractCompanyInfo(firstNew);
      setFormData((prev) => ({
        ...prev,
        companyName: info.companyName || prev.companyName,
        ticker: info.ticker ? info.ticker.toUpperCase() : prev.ticker,
        industry: info.industry || prev.industry,
        peers: info.peers || prev.peers,
      }));
      if (info.companyName || info.ticker) setAutoFilled(true);
    } catch { } finally { setExtracting(false); }
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "52px 24px", width: "100%" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input:focus { border-color: #111 !important; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ ...S.label, marginBottom: 12 }}>New Research Report</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, color: "#111", marginBottom: 6 }}>Upload Company Documents</h2>
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65 }}>Fields auto-fill from your document. Accepts 10-K, 10-Q, earnings transcripts, investor presentations.</p>
      </div>

      {error && (
        <div style={{ background: "#fff5f5", border: "0.5px solid #f0c0c0", color: "#8b2020", padding: "12px 16px", borderRadius: 6, fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current.click()}
        style={{ border: "0.5px dashed #c8c4bc", borderRadius: 8, background: "#fff", padding: "36px 24px", textAlign: "center", cursor: "pointer", marginBottom: 14, transition: "all 0.15s" }}
      >
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.docx" style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
        <div style={{ fontSize: 20, color: "#bbb", marginBottom: 8 }}>↑</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#333", marginBottom: 4 }}>Drop documents here or click to browse</div>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>Company fields will auto-fill from your document</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {["PDF", "TXT", "DOCX", "10-K", "10-Q"].map(t => (
            <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, background: "#f5f3ef", border: "0.5px solid #e0dcd4", color: "#888", padding: "3px 10px", borderRadius: 3 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {uploadedFiles.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "0.5px solid #e4e0d8", borderRadius: 6, padding: "10px 14px" }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span style={{ fontSize: 13, color: "#333", flex: 1 }}>{f.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#bbb" }}>{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => setUploadedFiles(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <hr style={S.divider} />

      {/* Company info */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={S.label}>Company Information</div>
        {extracting && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#888" }}>
            <div style={{ width: 10, height: 10, border: "1px solid #ccc", borderTopColor: "#555", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            Reading document...
          </div>
        )}
        {autoFilled && !extracting && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#1a6b3a" }}>✓ Auto-filled</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Company Name", id: "companyName", placeholder: "e.g. Apple Inc." },
          { label: "Ticker Symbol", id: "ticker", placeholder: "e.g. AAPL" },
          { label: "Industry / Sector", id: "industry", placeholder: "e.g. Consumer Technology" },
          { label: "Peer Companies (fill in if not auto-filled)", id: "peers", placeholder: "e.g. MSFT, GOOG" },
        ].map(({ label, id, placeholder }) => (
          <div key={id}>
            <div style={S.label}>{label}</div>
            <div style={{ position: "relative" }}>
              <input type="text" placeholder={placeholder} value={formData[id]}
                onChange={(e) => { setFormData(p => ({ ...p, [id]: e.target.value })); setAutoFilled(false); }}
                style={{ ...S.input, borderColor: autoFilled && formData[id] ? "#b8d4c0" : "#d8d4cc" }}
              />
              {extracting && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 10, height: 10, border: "1px solid #ccc", borderTopColor: "#555", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Perspective */}
      <div style={S.label}>Investment Perspective</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
        {PERSPECTIVES.map(p => {
          const active = formData.perspective === p.value;
          return (
            <button key={p.value} onClick={() => setFormData(prev => ({ ...prev, perspective: p.value }))}
              style={{ background: active ? "#111" : "#fff", border: `0.5px solid ${active ? "#111" : "#d8d4cc"}`, color: active ? "#fff" : "#666", fontFamily: "'Inter', sans-serif", fontSize: 12, padding: "10px 8px", borderRadius: 6, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: 0.65 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Depth */}
      <div style={S.label}>Report Depth</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 32 }}>
        {DEPTHS.map(d => {
          const active = formData.depth === d.value;
          return (
            <button key={d.value} onClick={() => setFormData(p => ({ ...p, depth: d.value }))}
              style={{ background: active ? "#111" : "#fff", border: `0.5px solid ${active ? "#111" : "#d8d4cc"}`, color: active ? "#fff" : "#666", fontFamily: "'Inter', sans-serif", fontSize: 12, padding: "10px", borderRadius: 6, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 500 }}>{d.label}</div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: 0.65 }}>{d.desc}</div>
            </button>
          );
        })}
      </div>

      <button onClick={onGenerate} disabled={extracting}
        style={{ width: "100%", background: extracting ? "#888" : "#111", color: "#faf8f4", border: "none", padding: "14px", borderRadius: 6, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, cursor: extracting ? "not-allowed" : "pointer", letterSpacing: "0.02em" }}>
        Generate Research Report
      </button>
    </div>
  );
}

import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import { GeneratingPage, ReportPage, HistoryPage } from "./components/Pages";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";


const EMPTY_FORM = {
  companyName: "", ticker: "", industry: "", peers: "",
  perspective: "neutral", depth: "standard",
};

export default function App() {
  const [page, setPage] = useState("landing");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentReport, setCurrentReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/reports`)
      .then(r => r.json())
      .then(data => {
        if (data.reports && data.reports.length > 0) {
          const formatted = data.reports.map(r => ({
            ...r,
            company_name: r.company_name,
            date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            documents: [],
          }));
          setSavedReports(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const goToNewReport = () => {
    setUploadedFiles([]);
    setFormData(EMPTY_FORM);
    setError("");
    setPage("upload");
  };

  const handleGenerate = async () => {
    setError("");
    if (!formData.companyName || !formData.ticker) {
      setError("Please enter company name and ticker symbol.");
      return;
    }
    setPage("generating");
    try {
      let documentIds = [];
      if (uploadedFiles.length > 0) {
        const fd = new FormData();
        uploadedFiles.forEach((f) => fd.append("files", f));
        const upRes = await fetch(`${API}/upload-documents`, { method: "POST", body: fd });
        if (!upRes.ok) throw new Error((await upRes.json()).detail || "Upload failed");
        const upData = await upRes.json();
        documentIds = upData.documents.map((d) => d.id);
      }
      const genRes = await fetch(`${API}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: formData.companyName,
          ticker: formData.ticker.toUpperCase(),
          industry: formData.industry,
          peers: formData.peers,
          perspective: formData.perspective,
          depth: formData.depth,
          document_ids: documentIds,
        }),
      });
      if (!genRes.ok) throw new Error((await genRes.json()).detail || "Generation failed");
      const genData = await genRes.json();
      const report = {
        ...genData,
        company_name: formData.companyName,
        ticker: formData.ticker.toUpperCase(),
        industry: formData.industry,
        peers: formData.peers,
        perspective: formData.perspective,
        depth: formData.depth,
        documents: uploadedFiles.map((f) => f.name),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setCurrentReport(report);
      setSavedReports((prev) => [report, ...prev]);
      setPage("report");
    } catch (err) {
      setError(err.message);
      setPage("upload");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b08", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <nav className="folio-no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 50, background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, color: "#f0ead8", fontStyle: "italic", cursor: "pointer" }}
          onClick={() => setPage("landing")}>
          Folio
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {[["landing","Home"],["upload","New Report"],["history","Reports"]].map(([p, label]) => (
            <button key={p} onClick={() => {
              if (p === "upload") { goToNewReport(); return; }
              setPage(p);
            }} style={{ background: page === p ? "rgba(255,255,255,0.06)" : "none", border: "none", color: page === p ? "#d0cec8" : "#555", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 400, padding: "6px 12px", borderRadius: 5, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
      </nav>
      <div style={{ background: "#faf8f4", minHeight: "calc(100vh - 50px)" }}>
        {page === "landing" && <LandingPage onStart={goToNewReport} />}
        {page === "upload" && (
          <UploadPage uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
            formData={formData} setFormData={setFormData}
            onGenerate={handleGenerate} error={error} setError={setError} />
        )}
        {page === "generating" && <GeneratingPage />}
        {page === "report" && currentReport && (
          <ReportPage report={currentReport} onNew={goToNewReport} onHistory={() => setPage("history")} />
        )}
        {page === "history" && (
          <HistoryPage reports={savedReports}
            onSelect={(r) => {
              if (r.id && !r.report) {
                fetch(`${API}/reports/${r.id}`)
                  .then(res => res.json())
                  .then(data => { setCurrentReport({ ...r, ...data }); setPage("report"); })
                  .catch(() => { setCurrentReport(r); setPage("report"); });
              } else {
                setCurrentReport(r);
                setPage("report");
              }
            }}
            onNew={goToNewReport} />
        )}
      </div>
    </div>
  );
}

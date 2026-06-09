import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import { GeneratingPage, ReportPage, HistoryPage } from "./components/Pages";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const EXAMPLE_REPORT = {
  company_name: "Apple Inc.",
  ticker: "AAPL",
  industry: "Consumer Technology",
  perspective: "neutral",
  depth: "standard",
  documents: ["apple-10k-2024.pdf"],
  date: "Sep 28, 2024",
  report: {
    executiveSummary: [
      "Apple reported $391.0 billion in total net sales for fiscal year 2024, reflecting a 2% increase year-over-year driven by Services growth offsetting modest hardware declines.",
      "Services revenue reached $96.2 billion, representing 25% of total revenue and growing 13% year-over-year — the fastest-growing segment and a key driver of margin expansion.",
      "iPhone remains the largest revenue segment at $201.2 billion, though down slightly from the prior year amid a challenging consumer electronics environment.",
      "Gross margin expanded to 46.2%, up from 44.1% in fiscal 2023, driven by the higher-margin Services mix and supply chain efficiencies.",
      "The company generated $108.8 billion in operating cash flow and returned over $94 billion to shareholders through buybacks and dividends.",
    ],
    companyOverview: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services. The company's product portfolio includes the iPhone, Mac, iPad, Apple Watch, and AirPods. Its Services segment encompasses the App Store, Apple Music, Apple TV+, iCloud, Apple Pay, and licensing. Apple sells through its retail and online stores, direct sales force, and third-party cellular network carriers, wholesalers, retailers, and resellers.",
    financialPerformance: "Apple's fiscal 2024 results demonstrated resilience amid a mixed macroeconomic environment. Total net sales of $391.0 billion grew 2% year-over-year. iPhone revenue of $201.2 billion declined modestly, while Mac ($29.9B) and iPad ($26.7B) both grew. Services revenue of $96.2 billion grew 13%. Gross margin of 46.2% expanded meaningfully, reflecting Services mix shift. Net income reached $93.7 billion with diluted EPS of $6.08, up 11% year-over-year.",
    industryPositioning: "Apple operates in the highly competitive global consumer electronics and digital services markets. The company competes against Samsung, Google, and Microsoft in hardware and platforms. Apple's principal competitive advantages include its integrated hardware-software ecosystem, brand loyalty, and distribution scale. The company's installed base of over 2 billion active devices provides a durable platform for Services monetization.",
    keyRisks: [
      "Greater China revenue of $74.6 billion represents 19% of total sales — ongoing geopolitical tensions and local competition from Huawei pose meaningful concentration risk.",
      "iPhone upgrade cycles are lengthening as hardware improvements become more incremental.",
      "Regulatory pressure on App Store commission rates in the EU and potential US antitrust actions could compress Services margins.",
      "Dependence on third-party manufacturing partners, primarily in China, creates supply chain concentration risk.",
      "Macroeconomic sensitivity of premium consumer electronics spending could dampen hardware demand.",
    ],
    bullCase: "Accelerating Services revenue growth drives a re-rating toward a higher multiple. Apple Intelligence and on-device AI features catalyze the largest iPhone upgrade cycle in years. Emerging market penetration, particularly in India, provides a multi-year growth runway.",
    baseCase: "Apple sustains low-to-mid single digit revenue growth, driven primarily by Services while iPhone remains roughly flat. Gross margins hold in the 45-47% range. The company continues returning substantial capital to shareholders.",
    bearCase: "A prolonged consumer spending slowdown reduces iPhone upgrade demand. Regulatory action forces App Store fee reductions, compressing Services margins. Huawei's resurgence in China accelerates market share losses.",
    valuationDiscussion: "Based on fiscal 2024 results, Apple trades at approximately 30x trailing earnings — a premium to the broader market reflecting its ecosystem durability and capital return program. Key valuation methodologies include DCF, P/E and EV/EBITDA comparables versus mega-cap technology peers, and a sum-of-the-parts analysis separating Hardware and Services.",
    recommendation: "HOLD",
    confidence: "MEDIUM",
    recommendationRationale: "Apple's business quality is exceptional — durable ecosystem, expanding margins, and fortress balance sheet. However, at ~30x earnings with modest near-term revenue growth, the risk/reward is balanced. A more compelling entry point or evidence of AI-driven upgrade cycle acceleration would support a more constructive stance.",
  }
};

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

  const handleViewExample = () => {
    setCurrentReport(EXAMPLE_REPORT);
    setPage("report");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b08", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 50, background: "#111", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
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
        {page === "landing" && <LandingPage onStart={goToNewReport} onExample={handleViewExample} />}
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

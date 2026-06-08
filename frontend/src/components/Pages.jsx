import { useState } from "react";

const FONTS = {
  serif: "'Playfair Display', serif",
  mono: "'JetBrains Mono', monospace",
  sans: "'Inter', sans-serif",
};

const perspLabel = (p) => ({ optimistic: "Optimistic", skeptical: "Skeptical", balanced: "Balanced", neutral: "Neutral", bullish: "Optimistic", bearish: "Skeptical", objective: "Neutral" }[p] || p);

export function GeneratingPage() {
  const steps = ["Extracting document content","Identifying financial data","Structuring research framework","Writing upside, base, and downside cases","Compiling investment memo"];
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 50px)",padding:"60px 24px",textAlign:"center"}}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{width:56,height:56,position:"relative",margin:"0 auto 36px"}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1px solid #ddd",borderTopColor:"#111",animation:"spin 1s linear infinite"}}/>
        <div style={{position:"absolute",inset:10,borderRadius:"50%",border:"0.5px solid #e4e0d8",borderBottomColor:"#888",animation:"spin 1.8s linear infinite reverse"}}/>
      </div>
      <h3 style={{fontFamily:FONTS.serif,fontSize:22,fontWeight:400,color:"#111",marginBottom:8}}>Analyzing Documents</h3>
      <p style={{fontSize:13,color:"#888",maxWidth:260,lineHeight:1.65,fontFamily:FONTS.mono}}>Generating your equity research memo...</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:28,alignItems:"flex-start"}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:"#bbb",fontFamily:FONTS.mono}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:"currentColor",flexShrink:0}}/>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({num,name,children,defaultOpen}){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{background:"#fff",border:"0.5px solid #e4e0d8",borderRadius:10,overflow:"hidden",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",background:open?"#fdfcfa":"#fff",borderBottom:open?"0.5px solid #e8e4dc":"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:FONTS.mono,fontSize:9,color:"#bbb",background:"#f5f3ef",padding:"2px 8px",borderRadius:3,letterSpacing:"0.06em"}}>{num}</span>
          <span style={{fontSize:13,fontWeight:500,color:"#111",letterSpacing:"0.01em"}}>{name}</span>
        </div>
        <span style={{color:"#ccc",transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",fontSize:11}}>▾</span>
      </button>
      {open&&<div style={{padding:"20px 22px"}}>{children}</div>}
    </div>
  );
}

export function ReportPage({report,onNew,onHistory}){
  const r=report.report||report;
  const meta=report;
  const recColor={BUY:"#1a6b3a",HOLD:"#7a5a10",AVOID:"#7a2020","NEEDS MORE RESEARCH":"#555"}[r.recommendation]||"#333";
  const recBg={BUY:"#f0f9f4",HOLD:"#fdf8ec",AVOID:"#fdf3f3","NEEDS MORE RESEARCH":"#f5f3ef"}[r.recommendation]||"#f5f3ef";
  const recBorder={BUY:"#c0dfc8",HOLD:"#e8d4a0",AVOID:"#e0c4c4","NEEDS MORE RESEARCH":"#d8d4cc"}[r.recommendation]||"#e4e0d8";
  const confPct={HIGH:85,MEDIUM:55,LOW:25}[r.confidence]||50;
  const confColor={HIGH:"#1a6b3a",MEDIUM:"#7a5a10",LOW:"#7a2020"}[r.confidence]||"#555";

  const sections=[
    {
      num:"A",name:"Executive Summary",
      content:(
        <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
          {(r.executiveSummary||[]).map((b,i)=>(
            <li key={i} style={{display:"flex",gap:12,fontSize:13,color:"#444",lineHeight:1.75,padding:"10px 14px",background:"#faf8f4",borderRadius:6,border:"0.5px solid #ece8e0"}}>
              <span style={{color:"#bbb",flexShrink:0,marginTop:2}}>—</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )
    },
    {num:"B",name:"Company Overview",content:(
      <div style={{background:"#faf8f4",border:"0.5px solid #ece8e0",borderRadius:8,padding:"16px 18px"}}>
        <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:0}}>{r.companyOverview}</p>
      </div>
    )},
    {num:"C",name:"Financial Performance Analysis",content:(
      <div style={{background:"#faf8f4",border:"0.5px solid #ece8e0",borderRadius:8,padding:"16px 18px"}}>
        <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:0}}>{r.financialPerformance}</p>
      </div>
    )},
    {num:"D",name:"Industry & Competitive Positioning",content:(
      <div style={{background:"#faf8f4",border:"0.5px solid #ece8e0",borderRadius:8,padding:"16px 18px"}}>
        <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:0}}>{r.industryPositioning}</p>
      </div>
    )},
    {
      num:"E",name:"Key Risks",
      content:(
        <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
          {(r.keyRisks||[]).map((risk,i)=>(
            <li key={i} style={{display:"flex",gap:12,fontSize:13,color:"#444",lineHeight:1.75,padding:"10px 14px",background:"#fdf8f8",borderRadius:6,border:"0.5px solid #f0dada"}}>
              <span style={{color:"#d4a0a0",flexShrink:0,marginTop:2}}>—</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      num:"F–H",name:"Upside / Base / Downside Case",
      content:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[
            {label:"↑ Upside Case",text:r.bullCase,bg:"#f0f9f4",border:"#c0dfc8",lc:"#1a6b3a"},
            {label:"→ Base Case",text:r.baseCase,bg:"#f3f4f8",border:"#c8cce0",lc:"#3a4a7a"},
            {label:"↓ Downside Case",text:r.bearCase,bg:"#fdf3f3",border:"#e0c4c4",lc:"#7a2020"},
          ].map(({label,text,bg,border,lc})=>(
            <div key={label} style={{background:bg,border:`0.5px solid ${border}`,borderRadius:8,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <div style={{fontFamily:FONTS.mono,fontSize:9,color:lc,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontWeight:500}}>{label}</div>
              <p style={{fontSize:12,color:"#444",lineHeight:1.7,margin:0}}>{text}</p>
            </div>
          ))}
        </div>
      )
    },
    {num:"I",name:"Valuation Discussion",content:(
      <div style={{background:"#faf8f4",border:"0.5px solid #ece8e0",borderRadius:8,padding:"16px 18px"}}>
        <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:0}}>{r.valuationDiscussion}</p>
      </div>
    )},
    {num:"J",name:"Investment Memo Conclusion",content:(
      <div style={{background:"#faf8f4",border:"0.5px solid #ece8e0",borderRadius:8,padding:"16px 18px"}}>
        <p style={{fontSize:13,color:"#444",lineHeight:1.85,margin:0}}>{r.recommendationRationale}</p>
      </div>
    )},
  ];

  return(
    <div style={{maxWidth:820,margin:"0 auto",padding:"40px 24px",width:"100%"}}>

      {/* Report header */}
      <div style={{background:"#fff",border:"0.5px solid #e4e0d8",borderRadius:10,overflow:"hidden",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{background:"#111",padding:"22px 26px 18px"}}>
          <div style={{fontFamily:FONTS.mono,fontSize:9,color:"#666",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Folio · Equity Research</div>
          <div style={{fontFamily:FONTS.serif,fontSize:26,fontWeight:400,color:"#fff",marginBottom:6}}>{meta.company_name}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:FONTS.mono,fontSize:11,color:"#888"}}>{meta.ticker}</span>
            <span style={{width:3,height:3,background:"#555",borderRadius:"50%"}}/>
            <span style={{fontSize:12,color:"#888",fontFamily:FONTS.sans}}>{meta.industry||"Equity Research"}</span>
            <span style={{fontFamily:FONTS.mono,fontSize:10,color:"#555",marginLeft:"auto"}}>{meta.date}</span>
          </div>
        </div>

        {/* Big 3-column verdict */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"0.5px solid #e8e4dc"}}>
          <div style={{padding:"20px 26px",background:recBg,borderRight:"0.5px solid #e8e4dc"}}>
            <div style={{fontFamily:FONTS.mono,fontSize:9,color:"#aaa",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Recommendation</div>
            <div style={{fontFamily:FONTS.serif,fontSize:24,fontWeight:400,color:recColor,letterSpacing:"0.01em"}}>{r.recommendation}</div>
          </div>
          <div style={{padding:"20px 26px",borderRight:"0.5px solid #e8e4dc"}}>
            <div style={{fontFamily:FONTS.mono,fontSize:9,color:"#aaa",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Confidence</div>
            <div style={{fontFamily:FONTS.serif,fontSize:24,fontWeight:400,color:confColor,marginBottom:10}}>{r.confidence}</div>
            <div style={{height:2,background:"#eee",borderRadius:1}}>
              <div style={{height:"100%",width:`${confPct}%`,background:confColor,borderRadius:1,transition:"width 0.6s ease"}}/>
            </div>
          </div>
          <div style={{padding:"20px 26px"}}>
            <div style={{fontFamily:FONTS.mono,fontSize:9,color:"#aaa",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Perspective</div>
            <div style={{fontFamily:FONTS.serif,fontSize:24,fontWeight:400,color:"#888",textTransform:"capitalize"}}>{perspLabel(meta.perspective)}</div>
          </div>
        </div>

        {meta.documents?.length>0&&(
          <div style={{padding:"8px 26px",fontFamily:FONTS.mono,fontSize:9,color:"#bbb",letterSpacing:"0.05em"}}>
            Sources: {meta.documents.join(" · ")}
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["+ New Report",onNew],["Research Library",onHistory]].map(([label,fn])=>(
          <button key={label} onClick={fn} style={{background:"#fff",border:"0.5px solid #d8d4cc",color:"#666",fontFamily:FONTS.sans,fontSize:12,padding:"7px 16px",borderRadius:5,cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      <div>
        {sections.map((s,i)=><Section key={i} num={s.num} name={s.name} defaultOpen={i===0}>{s.content}</Section>)}
      </div>

      <div style={{marginTop:20,padding:"12px 16px",background:"#fff",border:"0.5px solid #e4e0d8",borderRadius:6,fontFamily:FONTS.mono,fontSize:9,color:"#ccc",lineHeight:1.6}}>
        DISCLAIMER: Generated by Folio for informational and educational purposes only. Not investment advice. All analysis based solely on uploaded documents. Consult a licensed financial advisor before making investment decisions.
      </div>
    </div>
  );
}

export function HistoryPage({reports,onSelect,onNew}){
  if(!reports.length)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 50px)",textAlign:"center",padding:24}}>
      <div style={{fontFamily:FONTS.serif,fontSize:18,fontWeight:400,color:"#ccc",marginBottom:12,fontStyle:"italic"}}>No reports yet</div>
      <p style={{color:"#aaa",marginBottom:28,fontSize:13,maxWidth:280,lineHeight:1.65}}>Your research library is empty. Generate your first equity research report to get started.</p>
      <button onClick={onNew} style={{background:"#111",color:"#faf8f4",border:"none",padding:"12px 28px",borderRadius:4,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:FONTS.sans,letterSpacing:"0.02em"}}>
        Start a New Report
      </button>
    </div>
  );
  return(
    <div style={{maxWidth:720,margin:"0 auto",padding:"52px 24px",width:"100%"}}>
      <div style={{fontFamily:FONTS.mono,fontSize:10,color:"#aaa",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Research Library</div>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:28}}>
        <h2 style={{fontFamily:FONTS.serif,fontSize:26,fontWeight:400,color:"#111"}}>Saved Reports</h2>
        <button onClick={onNew} style={{background:"#111",color:"#faf8f4",border:"none",padding:"8px 18px",borderRadius:4,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:FONTS.sans}}>+ New Report</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:1,border:"0.5px solid #e4e0d8",borderRadius:8,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        {reports.map((r,i)=>{
          const rec=r.report?.recommendation||r.recommendation||"N/A";
          const rc={BUY:"#1a6b3a",HOLD:"#7a5a10",AVOID:"#7a2020"}[rec]||"#555";
          const rb={BUY:"#f0f9f4",HOLD:"#fdf8ec",AVOID:"#fdf3f3"}[rec]||"#f5f3ef";
          const rborder={BUY:"#c0dfc8",HOLD:"#e8d4a0",AVOID:"#e0c4c4"}[rec]||"#e4e0d8";
          return(
            <div key={i} onClick={()=>onSelect(r)}
              style={{display:"flex",alignItems:"center",gap:16,background:"#fff",borderBottom:i<reports.length-1?"0.5px solid #f0ece4":"none",padding:"18px 22px",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background="#fdfcfa"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
              <div style={{flex:1}}>
                <div style={{fontFamily:FONTS.serif,fontSize:16,fontWeight:400,color:"#111",marginBottom:4}}>{r.company_name}</div>
                <div style={{fontFamily:FONTS.mono,fontSize:10,color:"#bbb",letterSpacing:"0.04em"}}>{r.ticker}{r.industry?` · ${r.industry}`:""}{r.date?` · ${r.date}`:""}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:FONTS.mono,fontSize:10,background:rb,border:`0.5px solid ${rborder}`,color:rc,padding:"3px 10px",borderRadius:3,letterSpacing:"0.06em"}}>{rec}</span>
                <span style={{color:"#ccc",fontSize:12}}>›</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

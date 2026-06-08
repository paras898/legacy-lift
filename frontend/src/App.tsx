/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, 
  Cpu, 
  ShieldAlert, 
  Settings, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  ArrowRight, 
  Loader2,
  Database,
  Calculator,
  ScanSearch,
  Download,
  Share2,
  RefreshCcw,
  Terminal
} from "lucide-react";

type Stage = "INPUT" | "ANALYZING" | "RISK" | "GENERATING" | "CHECKLIST" | "REPORT";

interface LegacyExample {
  title: string;
  type: string;
  code: string;
  description: string;
}

const EXAMPLES: LegacyExample[] = [
  {
    title: "VB6 Database Call",
    type: "VB6",
    description: "Classic ADODB recordset retrieval with direct connection string.",
    code: `Public Sub GetUser(ID As Integer)
    Dim conn As New ADODB.Connection
    Dim rs As New ADODB.Recordset
    conn.Open "Provider=SQLOLEDB;Data Source=SERVER1;Initial Catalog=DB;User ID=sa;Password=secret"
    rs.Open "SELECT * FROM Users WHERE UserID = " & ID, conn
    If Not rs.EOF Then
        MsgBox rs("UserName")
    End If
    rs.Close
    conn.Close
End Sub`
  },
  {
    title: "Classic ASP Calculator",
    type: "ASP",
    description: "Simple interest calculation logic mixed with HTML template.",
    code: `<%
Dim principal, rate, time, interest
principal = Request.Form("principal")
rate = Request.Form("rate")
time = Request.Form("time")

If IsNumeric(principal) And IsNumeric(rate) And IsNumeric(time) Then
    interest = (principal * rate * time) / 100
    Response.Write "Total Interest: " & interest
Else
    Response.Write "Invalid input"
End If
%>`
  },
  {
    title: "VB6 Credit Check",
    type: "VB6",
    description: "Component-based business logic for evaluating credit worthiness.",
    code: `Function EvaluateCredit(Score As Integer, Income As Double) As String
    If Score > 750 Then
        EvaluateCredit = "Tier 1: Approved"
    ElseIf Score > 600 And Income > 50000 Then
        EvaluateCredit = "Tier 2: Conditional"
    Else
        EvaluateCredit = "Declined"
    End If
End Function`
  }
];

export default function App() {
  const [stage, setStage] = useState<Stage>("INPUT");
  const [legacyCode, setLegacyCode] = useState("");
  const [snippetId, setSnippetId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [modernCode, setModernCode] = useState<string>("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStage("INPUT");
    setLegacyCode("");
    setSnippetId(null);
    setAnalysis(null);
    setModernCode("");
    setChecklist([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!legacyCode) return;
    setLoading(true);
    setStage("ANALYZING");
    
    try {
      const res = await fetch("http://localhost:8080/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: legacyCode })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setSnippetId(data.snippet_id);
      setAnalysis(data.analysis);
    } catch (err) {
      setError("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!snippetId) return;
    setLoading(true);
    setStage("GENERATING");
    
    try {
      const res = await fetch(`http://localhost:8080/api/migrate/${snippetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setModernCode(data.modern_code);
      setChecklist(data.checklist);
    } catch (err) {
      setError("Migration failed.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeReport = () => {
    setStage("REPORT");
  };

  // Skip the intermediate Risk stage in the UI flow as it's now part of Analyze
  const handleToRisk = () => {
    setStage("RISK");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">LegacyBridge</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">Documentation</a>
            {stage === "REPORT" && (
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-all active:scale-95"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Pipeline Progress Indicator */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex items-center min-w-[800px]">
            <PipelineStep icon={<Code2 />} label="Input" active={stage === "INPUT"} completed={["ANALYZING", "RISK", "GENERATING", "CHECKLIST", "REPORT"].includes(stage)} />
            <PipelineConnector />
            <PipelineStep icon={<ScanSearch />} label="Analyser" active={stage === "ANALYZING"} completed={["RISK", "GENERATING", "CHECKLIST", "REPORT"].includes(stage)} />
            <PipelineConnector />
            <PipelineStep icon={<ShieldAlert />} label="Risk" active={stage === "RISK"} completed={["GENERATING", "CHECKLIST", "REPORT"].includes(stage)} />
            <PipelineConnector />
            <PipelineStep icon={<Settings />} label="Generator" active={stage === "GENERATING"} completed={["CHECKLIST", "REPORT"].includes(stage)} />
            <PipelineConnector />
            <PipelineStep icon={<CheckCircle2 />} label="Checklist" active={stage === "CHECKLIST"} completed={stage === "REPORT"} />
            <PipelineConnector />
            <PipelineStep icon={<FileText />} label="Report" active={stage === "REPORT"} completed={false} />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {stage === "INPUT" && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Modernize your legacy core.</h1>
                <p className="text-neutral-500 max-w-2xl">
                  Paste your VB6 or Classic ASP code below. LegacyBridge will analyze the flow, 
                  assess architectural risks, and generate modern components.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setLegacyCode(ex.code)}
                    className="flex flex-col items-start p-4 bg-white border border-neutral-200 rounded-2xl hover:border-black hover:shadow-xs transition-all text-left"
                  >
                    <div className="p-2 bg-neutral-50 rounded-lg mb-3">
                      {ex.type === "VB6" ? <Terminal className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-sm mb-1">{ex.title}</span>
                    <p className="text-xs text-neutral-500 line-clamp-2">{ex.description}</p>
                  </button>
                ))}
              </div>

              <div className="relative group">
                <textarea
                  value={legacyCode}
                  onChange={(e) => setLegacyCode(e.target.value)}
                  placeholder="Paste VB6, ASP, or COBOL logic here..."
                  className="w-full h-80 p-6 rounded-3xl border border-neutral-200 focus:border-black focus:ring-0 font-mono text-sm resize-none bg-white transition-all shadow-xs"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!legacyCode}
                  className="absolute bottom-6 right-6 px-8 py-3 bg-black text-white rounded-full font-semibold flex items-center gap-2 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                >
                  Start Analysis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {stage === "ANALYZING" && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-neutral-200 rounded-3xl p-12 text-center"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-black/5 rounded-full" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-black rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">LLM Flow Analysis</h2>
                    <p className="text-neutral-500 animate-pulse">Deconstructing logic blocks and identifying patterns...</p>
                  </div>
                </div>
              ) : (
                <div className="text-left space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Analysis Results</h2>
                    <button 
                      onClick={() => setStage("RISK")}
                      className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 active:scale-95 transition-all"
                    >
                      View Risk Assessment
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 inline-flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Summary
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {analysis?.summary}
                      </p>
                    </div>
                    <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 inline-flex items-center gap-2">
                        <ScanSearch className="w-4 h-4" /> Identified Patterns
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.patterns?.map((p: string, idx: number) => (
                          <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-mono border border-neutral-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {stage === "RISK" && (
            <motion.div 
              key="risk"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-neutral-200 rounded-3xl p-12"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Risk Assessment</h2>
                    <p className="text-neutral-500">Engine-calculated modernization friction.</p>
                  </div>
                  <button 
                    onClick={handleMigration}
                    className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 active:scale-95 transition-all"
                  >
                    Generate Modern Code
                  </button>
                </div>

                <div className={`flex items-center gap-4 p-6 border rounded-2xl ${
                  analysis?.risk === "High" ? "bg-red-50 border-red-100" : 
                  analysis?.risk === "Medium" ? "bg-orange-50 border-orange-100" : 
                  "bg-emerald-50 border-emerald-100"
                }`}>
                  <ShieldAlert className={`w-8 h-8 ${
                    analysis?.risk === "High" ? "text-red-500" : 
                    analysis?.risk === "Medium" ? "text-orange-500" : 
                    "text-emerald-500"
                  }`} />
                  <div>
                    <span className="text-xs font-bold uppercase opacity-60">Rule-Based Risk Classification</span>
                    <div className="text-xl font-bold">{analysis?.risk} Priority Migration</div>
                  </div>
                </div>

                <div className="p-6 bg-neutral-50 rounded-2xl">
                  <h3 className="font-bold mb-4">Risk Logic</h3>
                  <p className="text-sm text-neutral-500 italic">
                    This risk classification is generated by a deterministic rule engine independent of the LLM, 
                    evaluating language-specific hazards like direct COM objects, spaghetti control flow, 
                    and hardcoded logic boundaries.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {stage === "GENERATING" && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-white border border-neutral-200 rounded-3xl p-1 shadow-sm">
                <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <span className="ml-4 text-xs font-mono text-neutral-400">output/SpringController.java</span>
                  </div>
                  {!loading && (
                    <button 
                      onClick={() => setStage("CHECKLIST")}
                      className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 active:scale-95 transition-all"
                    >
                      Define Checklist
                    </button>
                  )}
                </div>
                <div className="p-6 bg-[#121212] rounded-b-3xl overflow-x-auto">
                  {loading ? (
                    <pre className="text-neutral-500 font-mono text-sm animate-pulse">
                      Synthesizing modern Spring Boot architecture...
                    </pre>
                  ) : (
                    <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
                      <code>{modernCode}</code>
                    </pre>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {stage === "CHECKLIST" && (
            <motion.div 
              key="checklist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-12"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Migration Action Items</h2>
                <button 
                  onClick={finalizeReport}
                  className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 active:scale-95 transition-all"
                >
                  Final Report
                </button>
              </div>

              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <label key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-neutral-300 text-black shadow-sm" />
                    <span className="text-neutral-700 font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {stage === "REPORT" && (
            <motion.div 
              key="report"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-neutral-200 rounded-3xl p-12 shadow-2xl space-y-12 print:shadow-none print:border-none"
            >
              <div className="flex justify-between items-start border-b border-neutral-100 pb-12">
                <div>
                  <div className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-4 inline-block">
                    Full Modernization Comparison
                  </div>
                  <h1 className="text-5xl font-black tracking-tight">{snippetId}</h1>
                  <p className="text-neutral-500 mt-2 font-medium">Migration Engine v1.0 • {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-4 py-2 rounded-full text-xs font-bold border ${
                    analysis?.risk === "High" ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                  }`}>
                    {analysis?.risk} Risk
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">Legacy Summary</h3>
                  <p className="text-neutral-600 leading-relaxed font-medium">
                    {analysis?.summary}
                  </p>
                </section>
                
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6">Migration Strategy</h3>
                  <div className="space-y-3">
                    {checklist.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Structural Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 overflow-y-auto">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Source (Legacy)</span>
                    <pre className="text-xs font-mono opacity-60"><code>{legacyCode}</code></pre>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 overflow-y-auto">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 mb-2 block">Target (Spring Boot)</span>
                    <pre className="text-xs font-mono text-emerald-400"><code>{modernCode}</code></pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8 border-t border-neutral-100 no-print">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 px-8 py-3 rounded-full border border-neutral-200 font-bold hover:bg-neutral-50 transition-all active:scale-95"
                >
                  <RefreshCcw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* API Interaction Note for User */}
      {stage !== "INPUT" && (
        <div className="fixed bottom-6 left-6 max-w-xs p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl z-50 text-[10px] text-neutral-400 pointer-events-none">
          <p><strong>System Note:</strong> Gemini API calls are routed through client-side SDK. Migration reports are accessible via <code>/api/report</code> internal mock endpoints.</p>
        </div>
      )}
    </div>
  );
}

function PipelineStep({ icon, label, active, completed }: { icon: React.ReactNode, label: string, active: boolean, completed: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${active ? 'scale-110' : completed ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${completed ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-black text-white ring-4 ring-neutral-100' : 'bg-white border border-neutral-200 text-neutral-400'}`}>
        {completed ? <CheckCircle2 className="w-6 h-6" /> : React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className={`text-xs font-bold tracking-wide uppercase ${active ? 'text-black' : 'text-neutral-400'}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="w-1.5 h-1.5 bg-black rounded-full"
        />
      )}
    </div>
  );
}

function PipelineConnector() {
  return (
    <div className="w-12 flex items-center justify-center mx-2 h-12">
      <div className="w-full h-px bg-neutral-100" />
    </div>
  );
}

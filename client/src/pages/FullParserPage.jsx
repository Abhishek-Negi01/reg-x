import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../services/api";
import FirstFollowTable  from "../components/FirstFollowTable";
import ParsingTable      from "../components/ParsingTable";
import ParseTreeGraph    from "../components/ParseTreeGraph";
import LL1StepVisualizer from "../components/LL1StepVisualizer";

const DEFAULT_GRAMMAR = `E -> T E'\nE' -> + T E' | ε\nT -> F T'\nT' -> * F T' | ε\nF -> ( E ) | id`;
const DEFAULT_START   = "E";
const DEFAULT_INPUT   = "id + id * id";

const TABS = ["FIRST", "FOLLOW", "Table", "Parse Tree", "Steps"];
const TAB_COLORS = {
  "FIRST":      "#818CF8",
  "FOLLOW":     "#34D399",
  "Table":      "#FBBF24",
  "Parse Tree": "#F472B6",
  "Steps":      "#60A5FA",
};

function parseGrammarString(str) {
  const grammar = {};
  str.trim().split("\n").forEach(line => {
    const [lhs, rhs] = line.split("->").map(s => s.trim());
    if (!lhs || !rhs) return;
    grammar[lhs] = rhs.split("|").map(alt => alt.trim().split(/\s+/));
  });
  return grammar;
}

export default function FullParserPage() {
  const [grammarStr,  setGrammarStr]  = useState(DEFAULT_GRAMMAR);
  const [startSymbol, setStartSymbol] = useState(DEFAULT_START);
  const [inputStr,    setInputStr]    = useState(DEFAULT_INPUT);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [activeTab,   setActiveTab]   = useState("FIRST");

  async function handleRun() {
    setError(""); setResult(null); setLoading(true);
    try {
      const lexResult = await api.tokenize(inputStr.trim());
      const tokens = lexResult.tokens.filter(t => t.type !== "ERROR");
      const grammar = parseGrammarString(grammarStr);
      const res = await api.fullParserPipeline(tokens, grammar, startSymbol.trim());
      if (!res.success) throw new Error(res.error || "Pipeline failed");
      setResult(res);
      setActiveTab("FIRST");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() { setResult(null); setError(""); }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>LL(1) Parser Pipeline</h1>
          <p style={{ fontSize: 14 }}>
            Compute FIRST / FOLLOW sets, build the parsing table, and animate LL(1) parsing
          </p>
          <div className="pipeline-crumb" style={{ marginTop: 10 }}>
            {["Grammar", "FIRST", "FOLLOW", "Table", "Parse", "Tree"].map((s, i, arr) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{s}</span>
                {i < arr.length - 1 && <span style={{ color: "#374151" }}>→</span>}
              </span>
            ))}
          </div>
        </div>
        {result && <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>}
      </div>

      {/* Input section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}
        className="parser-input-grid">
        {/* Grammar */}
        <div className="card" style={{ padding: 20 }}>
          <span className="label" style={{ marginBottom: 10 }}>Grammar</span>
          <textarea
            className="rx-input"
            rows={7}
            style={{ resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
            value={grammarStr}
            onChange={e => setGrammarStr(e.target.value)}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 100 }}>
              <span className="label" style={{ marginBottom: 6 }}>Start Symbol</span>
              <input
                className="rx-input"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                value={startSymbol}
                onChange={e => setStartSymbol(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Input string */}
        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
          <span className="label" style={{ marginBottom: 10 }}>Input Expression</span>
          <textarea
            className="rx-input"
            rows={3}
            style={{ resize: "none" }}
            placeholder="e.g. id + id * id"
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, color: "#6B7280" }}>Examples:</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {["id + id * id", "id * id", "( id + id ) * id"].map(ex => (
                <button key={ex} className="chip" onClick={() => setInputStr(ex)}>{ex}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleRun}
              disabled={loading || !grammarStr.trim() || !inputStr.trim()}
            >
              {loading ? <><span className="spinner" />Running Pipeline…</> : "▶ Run Full Pipeline"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="banner banner-error anim-fade-in" style={{ marginBottom: 20 }}>
          <span style={{ flexShrink: 0 }}>⚠</span>
          <div>
            <div style={{ fontWeight: 700 }}>Pipeline Error</div>
            <div style={{ fontSize: 13, marginTop: 2, opacity: 0.85 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tab bar */}
          <div style={{
            display: "flex", gap: 4, flexWrap: "wrap",
            marginBottom: 16, padding: "4px",
            background: "#111827", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {TABS.map(tab => {
              const active = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "7px 16px", borderRadius: 7,
                  fontSize: 13, fontWeight: 600,
                  border: "none", cursor: "pointer",
                  transition: "all 0.18s",
                  background: active ? "#1F2937" : "transparent",
                  color: active ? TAB_COLORS[tab] : "#6B7280",
                  boxShadow: active ? `0 0 0 1px ${TAB_COLORS[tab]}40` : "none",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#9CA3AF"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#6B7280"; }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "FIRST" && (
                <FirstFollowTable data={result.first} title="FIRST Sets" color="#818CF8" />
              )}
              {activeTab === "FOLLOW" && (
                <FirstFollowTable data={result.follow} title="FOLLOW Sets" color="#34D399" />
              )}
              {activeTab === "Table" && (
                <ParsingTable table={result.table} isLL1={true} />
              )}
              {activeTab === "Parse Tree" && result.parseTree && (
                <ParseTreeGraph tree={result.parseTree} />
              )}
              {activeTab === "Steps" && result.steps?.length > 0 && (
                <LL1StepVisualizer steps={result.steps} />
              )}
              {activeTab === "Steps" && !result.steps?.length && (
                <div className="empty-state">
                  <span className="empty-state-icon">📋</span>
                  <p className="empty-state-title">No steps available</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="empty-state">
          <span className="empty-state-icon">⊢</span>
          <p className="empty-state-title">Configure grammar and input, then run the pipeline</p>
          <p className="empty-state-sub">
            The default grammar is the standard arithmetic expression grammar.
            Change it or use your own LL(1) grammar.
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .parser-input-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

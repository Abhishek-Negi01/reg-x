import { useState } from "react";
import AutomataGraph from "../components/AutomataGraph";
import CodeBlock from "../components/CodeBlock";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../services/api";
import { automataToGraph } from "../services/api";

const STEPS    = ["NFA", "DFA", "Minimized DFA"];
const EXAMPLES = ["a|b", "(a|b)*abb", "ab*c", "a(b|c)*"];

const STEP_META = {
  "NFA":          { color: "#818CF8", desc: "Thompson Construction"  },
  "DFA":          { color: "#34D399", desc: "Subset Construction"    },
  "Minimized DFA":{ color: "#FBBF24", desc: "Partition Refinement"   },
};

export default function AutomataPage() {
  const [regex,       setRegex]       = useState("");
  const [step,        setStep]        = useState(-1);
  const [graphs,      setGraphs]      = useState({});
  const [automata,    setAutomata]    = useState({});
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [genCode,     setGenCode]     = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const activeGraph = step >= 0 ? graphs[STEPS[step]] : null;

  function reset() {
    setRegex(""); setStep(-1); setGraphs({}); setAutomata({});
    setError(""); setGenCode("");
  }

  async function handleGenerate() {
    if (!regex.trim()) return;
    setError(""); setLoading(true); setGraphs({}); setAutomata({}); setStep(-1); setGenCode("");
    try {
      const res = await api.regexToNFA(regex.trim());
      setGraphs({ NFA: res.graph });
      setAutomata({ NFA: res.automata });
      setStep(0);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  async function handleToDFA() {
    setError(""); setLoading(true);
    try {
      const res = await api.nfaToDFA(automata.NFA);
      setGraphs(g  => ({ ...g, DFA: automataToGraph(res) }));
      setAutomata(a => ({ ...a, DFA: res }));
      setStep(1);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  async function handleMinimize() {
    setError(""); setLoading(true);
    try {
      const res = await api.minimizeDFA(automata.DFA);
      setGraphs(g => ({ ...g, "Minimized DFA": automataToGraph(res) }));
      setAutomata(a => ({ ...a, "Minimized DFA": res }));
      setStep(2);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  async function handleGenerateCode() {
    const dfa = automata["Minimized DFA"] || automata.DFA;
    if (!dfa) return;
    setError(""); setCodeLoading(true); setGenCode("");
    try {
      const res = await api.generateCode(dfa);
      setGenCode(res.code);
    } catch (e) { setError(e.message); }
    finally     { setCodeLoading(false); }
  }

  const canGenerateCode = !!(automata["Minimized DFA"] || automata.DFA);

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Automata Visualizer</h1>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            Convert a regular expression through the full automata pipeline
          </p>
          <div className="pipeline-crumb">
            {["Regex", "NFA", "DFA", "Min DFA"].map((s, i, arr) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{s}</span>
                {i < arr.length - 1 && <span style={{ color: "#374151" }}>→</span>}
              </span>
            ))}
          </div>
        </div>
        {step >= 0 && <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>}
      </div>

      {/* Input card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <span className="label" style={{ marginBottom: 12 }}>Regular Expression</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            className="rx-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="e.g. (a|b)*abb"
            value={regex}
            onChange={e => setRegex(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
          />
          <button className="btn btn-primary btn-lg"
            onClick={handleGenerate} disabled={loading || !regex.trim()}>
            {loading ? <><span className="spinner" />Building…</> : "Generate NFA"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#6B7280" }}>Try:</span>
          {EXAMPLES.map(ex => (
            <button key={ex} className="chip" onClick={() => setRegex(ex)}>{ex}</button>
          ))}
        </div>
      </div>

      {error && (
        <div className="banner banner-error anim-fade-in" style={{ marginBottom: 20 }}>
          <span style={{ flexShrink: 0 }}>⚠</span> {error}
        </div>
      )}

      {/* Pipeline tabs */}
      {step >= 0 && (
        <div className="anim-fade-up" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {STEPS.map((s, i) => {
                const done = !!graphs[s], active = step === i;
                return (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => done && setStep(i)}
                      disabled={!done}
                      className={`pill ${active ? "pill-active" : done ? "pill-done" : "pill-locked"}`}
                      style={active ? { borderColor: STEP_META[s].color + "80", color: STEP_META[s].color } : {}}
                    >
                      <span style={{ opacity: 0.5, fontSize: 10 }}>{i + 1}</span>
                      {s}
                      {done && !active && <span style={{ color: "#34D399", fontSize: 10 }}>✓</span>}
                    </button>
                    {i < STEPS.length - 1 && <span style={{ color: "#374151", fontSize: 13 }}>→</span>}
                  </span>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {graphs.NFA && !graphs.DFA && (
                <button className="btn btn-success btn-sm" onClick={handleToDFA} disabled={loading}>
                  {loading ? <><span className="spinner" />Converting…</> : "NFA → DFA"}
                </button>
              )}
              {graphs.DFA && !graphs["Minimized DFA"] && (
                <button className="btn btn-warning btn-sm" onClick={handleMinimize} disabled={loading}>
                  {loading ? <><span className="spinner" />Minimizing…</> : "Minimize DFA"}
                </button>
              )}
              {canGenerateCode && (
                <button className="btn btn-cyan btn-sm" onClick={handleGenerateCode} disabled={codeLoading}>
                  {codeLoading ? <><span className="spinner" />Generating…</> : "⟨/⟩ Generate Code"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      {activeGraph && (
        <div className="anim-scale-in">
          <div className="step-info-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: STEP_META[STEPS[step]].color,
              }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "#F9FAFB" }}>{STEPS[step]}</span>
              <span style={{
                fontSize: 12, color: "#9CA3AF",
                background: "#111827", border: "1px solid rgba(255,255,255,0.08)",
                padding: "2px 8px", borderRadius: 5,
              }}>
                {STEP_META[STEPS[step]].desc}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 12, color: "#6B7280" }}>
              {activeGraph.nodes.length} states · {activeGraph.edges.length} transitions
            </span>
          </div>
          <AutomataGraph nodes={activeGraph.nodes} edges={activeGraph.edges} />
        </div>
      )}

      {/* Code generation output */}
      <AnimatePresence>
        {genCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: 24 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06B6D4", flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#F9FAFB" }}>Generated Recognizer</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                  background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)",
                  color: "#67E8F9",
                }}>JavaScript</span>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={() => setGenCode("")}>✕ Close</button>
            </div>
            <CodeBlock code={genCode} filename="recognizer.js" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {step === -1 && !loading && (
        <div className="empty-state">
          <span className="empty-state-icon">⬡</span>
          <p className="empty-state-title">Enter a regular expression to begin</p>
          <p className="empty-state-sub">
            Supports concatenation, union (|), Kleene star (*).
            Try <code className="mono" style={{ color: "#818CF8" }}>(a|b)*abb</code>
          </p>
        </div>
      )}
    </div>
  );
}

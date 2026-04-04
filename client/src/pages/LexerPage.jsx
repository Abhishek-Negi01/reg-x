import { useState } from "react";
import TokenViewer from "../components/TokenViewer";
import StepVisualizer from "../components/StepVisualizer";
import * as api from "../services/api";

const EXAMPLES = ["if abc + while", "x + y * (z)", "hello world return"];

export default function LexerPage() {
  const [input,      setInput]      = useState("");
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [activeStep, setActiveStep] = useState(null);

  async function handleTokenize() {
    if (!input.trim()) return;
    setError(""); setResult(null); setActiveStep(null); setLoading(true);
    try { setResult(await api.tokenize(input)); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }

  function reset() { setInput(""); setResult(null); setActiveStep(null); setError(""); }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Lexer Simulator</h1>
          <p style={{ fontSize: 14 }}>Tokenize source code and animate DFA transitions character by character</p>
        </div>
        {result && <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>}
      </div>

      {/* Input card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <span className="label" style={{ marginBottom: 12 }}>Source Input</span>
        <textarea
          className="rx-input"
          rows={3} style={{ resize: "none" }}
          placeholder="Enter source code to tokenize…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#6B7280" }}>Try:</span>
            {EXAMPLES.map(ex => (
              <button key={ex} className="chip" onClick={() => setInput(ex)}>{ex}</button>
            ))}
          </div>
          <button className="btn btn-primary"
            onClick={handleTokenize} disabled={loading || !input.trim()}>
            {loading ? <><span className="spinner" />Tokenizing…</> : "Tokenize"}
          </button>
        </div>
      </div>

      {error && (
        <div className="banner banner-error anim-fade-in" style={{ marginBottom: 20 }}>
          <span style={{ flexShrink: 0 }}>⚠</span> {error}
        </div>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="anim-fade-up">

          {/* Status */}
          <div className={`banner ${result.success ? "banner-success" : "banner-warning"}`}>
            <span style={{ flexShrink: 0 }}>{result.success ? "✓" : "⚠"}</span>
            {result.success
              ? `Tokenized successfully — ${result.tokens.length} token${result.tokens.length !== 1 ? "s" : ""}`
              : `Tokenized with ${result.errors.length} error(s) — ${result.tokens.length} tokens`}
          </div>

          {/* Tokens */}
          <div className="card" style={{ padding: 24 }}>
            <TokenViewer tokens={result.tokens} errors={result.errors} />
          </div>

          {/* DFA Steps */}
          {result.steps?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <span className="label" style={{ marginBottom: 14 }}>DFA Simulation</span>
              <p style={{ fontSize: 13, marginBottom: 14 }}>Select a token to animate its DFA traversal:</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {result.steps.map((s, i) => (
                  <button key={i}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    style={{
                      padding: "7px 16px", borderRadius: 8,
                      border: `1px solid ${activeStep === i ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                      background: activeStep === i ? "#1F2937" : "#1F2937",
                      color: activeStep === i ? "#A5B4FC" : "#9CA3AF",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (activeStep !== i) { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.color = "#E5E7EB"; }}}
                    onMouseLeave={e => { if (activeStep !== i) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9CA3AF"; }}}
                  >
                    "{s.token}"
                  </button>
                ))}
              </div>

              {activeStep !== null && result.steps[activeStep]?.steps?.length > 0 && (
                <div className="anim-scale-in">
                  <StepVisualizer steps={result.steps[activeStep].steps} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state">
          <span className="empty-state-icon">◈</span>
          <p className="empty-state-title">Enter source code to tokenize</p>
          <p className="empty-state-sub">Recognizes identifiers, keywords, operators (+, *), and parentheses.</p>
        </div>
      )}
    </div>
  );
}

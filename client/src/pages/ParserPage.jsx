import { useState } from "react";
import ParseTreeGraph from "../components/ParseTreeGraph";
import TokenViewer from "../components/TokenViewer";
import * as api from "../services/api";

const EXAMPLES = ["x + y * z", "a + b", "(x + y) * z", "a * b + c * d"];

const GRAMMAR = [
  ["E",  "T  E′"],
  ["E′", "+ T  E′  |  ε"],
  ["T",  "F  T′"],
  ["T′", "* F  T′  |  ε"],
  ["F",  "id  |  ( E )"],
];

export default function ParserPage() {
  const [input,   setInput]   = useState("");
  const [tokens,  setTokens]  = useState(null);
  const [tree,    setTree]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleParse() {
    if (!input.trim()) return;
    setError(""); setTokens(null); setTree(null); setLoading(true);
    try {
      const lexResult = await api.tokenize(input.trim());
      setTokens(lexResult.tokens);
      const valid = lexResult.tokens.filter(t => !["ERROR","KEYWORD"].includes(t.type));
      if (!valid.length) throw new Error("No valid tokens. Use single-letter identifiers: x, y, z.");
      const parseResult = await api.parseTree(valid);
      if (!parseResult.success) throw new Error(parseResult.error || "Parse failed");
      setTree(parseResult.tree);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }

  function reset() { setInput(""); setTokens(null); setTree(null); setError(""); }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Parse Tree Visualizer</h1>
          <p style={{ fontSize: 14 }}>Tokenize an arithmetic expression and build its LL(1) parse tree</p>
        </div>
        {(tokens || tree) && <button className="btn btn-ghost btn-sm" onClick={reset}>↺ Reset</button>}
      </div>

      <div className="parser-layout">

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* Input */}
          <div className="card" style={{ padding: 24 }}>
            <span className="label" style={{ marginBottom: 12 }}>Expression</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                className="rx-input"
                style={{ flex: 1, minWidth: 180 }}
                placeholder="e.g. x + y * z"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleParse()}
              />
              <button className="btn btn-primary"
                onClick={handleParse} disabled={loading || !input.trim()}>
                {loading ? <><span className="spinner" />Parsing…</> : "Parse"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#6B7280" }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button key={ex} className="chip" onClick={() => setInput(ex)}>{ex}</button>
              ))}
            </div>
          </div>

          {error && (
            <div className="banner banner-error anim-fade-in">
              <span style={{ flexShrink: 0 }}>⚠</span> {error}
            </div>
          )}

          {tokens && (
            <div className="card anim-fade-up" style={{ padding: 24 }}>
              <span className="label" style={{ marginBottom: 14 }}>Token Stream</span>
              <TokenViewer tokens={tokens} errors={[]} />
            </div>
          )}

          {tree && (
            <div className="anim-scale-in">
              <span className="label" style={{ marginBottom: 12, display: "block" }}>Parse Tree</span>
              <ParseTreeGraph tree={tree} />
            </div>
          )}

          {!tokens && !loading && (
            <div className="empty-state">
              <span className="empty-state-icon">⊢</span>
              <p className="empty-state-title">Enter an arithmetic expression</p>
              <p className="empty-state-sub">
                Use single-letter identifiers (x, y, z) with +, *, and parentheses.
              </p>
            </div>
          )}
        </div>

        {/* Grammar panel */}
        <div className="card grammar-panel" style={{ padding: 20, position: "sticky", top: 72 }}>
          <span className="label" style={{ marginBottom: 16 }}>Grammar LL(1)</span>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {GRAMMAR.map(([lhs, rhs]) => (
              <div key={lhs} className="grammar-row">
                <span className="grammar-lhs">{lhs}</span>
                <span className="grammar-arrow">→</span>
                <span className="grammar-rhs">{rhs}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: "16px 0" }} />

          <span className="label" style={{ marginBottom: 12 }}>Node Colors</span>
          {[
            { color: "#818CF8", bg: "#3730A3", label: "Non-terminal" },
            { color: "#34D399", bg: "#065F46", label: "Terminal"     },
            { color: "#9CA3AF", bg: "#374151", label: "ε (empty)"    },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                background: bg, border: `1.5px solid ${color}`,
              }} />
              <span style={{ fontSize: 12, color: "#E5E7EB", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

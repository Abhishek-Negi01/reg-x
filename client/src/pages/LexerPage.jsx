import { useState } from "react";
import TokenViewer from "../components/TokenViewer";
import * as api from "../services/api";

const EXAMPLES = ["if abc + while", "x + y * (z)", "hello world return"];

export default function LexerPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(null);

  async function handleTokenize() {
    if (!input.trim()) return;
    setError("");
    setResult(null);
    setActiveStep(null);
    setLoading(true);
    try {
      const res = await api.tokenize(input);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Lexer Simulator</h1>
        <p className="text-gray-400 text-sm">Tokenize source code and inspect DFA transitions step by step</p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <textarea
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          rows={3}
          placeholder="Enter source code to tokenize..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md transition-colors font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
          <button
            onClick={handleTokenize}
            disabled={loading || !input.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? "Tokenizing..." : "Tokenize"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Status banner */}
          <div
            className={`rounded-lg px-4 py-2.5 text-sm font-medium border ${
              result.success
                ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                : "bg-yellow-950 border-yellow-800 text-yellow-300"
            }`}
          >
            {result.success
              ? `✓ Tokenized successfully — ${result.tokens.length} tokens`
              : `⚠ Tokenized with ${result.errors.length} error(s) — ${result.tokens.length} tokens`}
          </div>

          <TokenViewer tokens={result.tokens} errors={result.errors} />

          {/* DFA Steps */}
          {result.steps?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-widest">DFA Simulation Steps</p>
              <div className="flex flex-wrap gap-2">
                {result.steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                      activeStep === i
                        ? "bg-indigo-700 border-indigo-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600"
                    }`}
                  >
                    &quot;{s.token}&quot;
                  </button>
                ))}
              </div>

              {activeStep !== null && result.steps[activeStep] && (
                <StepDetail step={result.steps[activeStep]} input={input} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepDetail({ step, input }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-white font-mono">&quot;{step.token}&quot;</span>
        <span className="text-xs text-gray-400">{step.steps.length} transitions</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="px-4 py-2 text-left font-medium">#</th>
              <th className="px-4 py-2 text-left font-medium">State</th>
              <th className="px-4 py-2 text-left font-medium">Char</th>
              <th className="px-4 py-2 text-left font-medium">Next State</th>
            </tr>
          </thead>
          <tbody>
            {step.steps.map((s, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2 text-indigo-300">{s.state}</td>
                <td className="px-4 py-2">
                  <span className="px-1.5 py-0.5 bg-gray-700 rounded text-yellow-300">{s.char}</span>
                </td>
                <td className="px-4 py-2 text-emerald-300">{s.nextState ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

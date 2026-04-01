import { useState } from "react";
import AutomataGraph from "../components/AutomataGraph";
import * as api from "../services/api";
import { automataToGraph } from "../services/api";

const STEPS = ["NFA", "DFA", "Minimized DFA"];

function StepBadge({ label, active, done }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? "bg-indigo-600 border-indigo-500 text-white"
          : done
          ? "bg-gray-700 border-gray-600 text-gray-300"
          : "bg-gray-900 border-gray-700 text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}

export default function AutomataPage() {
  const [regex, setRegex] = useState("");
  const [step, setStep] = useState(-1); // -1 = nothing yet
  const [graphs, setGraphs] = useState({}); // { NFA, DFA, "Minimized DFA" }
  const [automata, setAutomata] = useState({}); // raw automata objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeGraph = step >= 0 ? graphs[STEPS[step]] : null;

  async function handleGenerate() {
    if (!regex.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.regexToNFA(regex.trim());
      setGraphs({ NFA: res.graph });
      setAutomata({ NFA: res.automata });
      setStep(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToDFA() {
    setError("");
    setLoading(true);
    try {
      const res = await api.nfaToDFA(automata.NFA);
      // res is a flat automata object (no graph property)
      const graph = automataToGraph(res);
      setGraphs((g) => ({ ...g, DFA: graph }));
      setAutomata((a) => ({ ...a, DFA: res }));
      setStep(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMinimize() {
    setError("");
    setLoading(true);
    try {
      const res = await api.minimizeDFA(automata.DFA);
      // res is also a flat automata object
      const graph = automataToGraph(res);
      setGraphs((g) => ({ ...g, "Minimized DFA": graph }));
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Automata Visualizer</h1>
        <p className="text-gray-400 text-sm">Convert a regular expression through NFA → DFA → Minimized DFA</p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="Enter regex, e.g. (a|b)*abb"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !regex.trim()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {loading && step === -1 ? "..." : "Generate NFA"}
        </button>
      </div>

      {/* Pipeline steps */}
      {step >= 0 && (
        <div className="flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => setStep(i)}
                disabled={!graphs[s]}
                className="disabled:cursor-not-allowed"
              >
                <StepBadge label={s} active={step === i} done={!!graphs[s] && step !== i} />
              </button>
              {i < STEPS.length - 1 && <span className="text-gray-600">→</span>}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Graph */}
      {activeGraph && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300">{STEPS[step]}</p>
            <div className="flex gap-2">
              {step === 0 && !graphs.DFA && (
                <button
                  onClick={handleToDFA}
                  disabled={loading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Converting..." : "Convert to DFA →"}
                </button>
              )}
              {step === 1 && !graphs["Minimized DFA"] && (
                <button
                  onClick={handleMinimize}
                  disabled={loading}
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Minimizing..." : "Minimize DFA →"}
                </button>
              )}
            </div>
          </div>
          <AutomataGraph nodes={activeGraph.nodes} edges={activeGraph.edges} />
          <p className="text-xs text-gray-500">
            {activeGraph.nodes.length} states · {activeGraph.edges.length} transitions
          </p>
        </div>
      )}
    </div>
  );
}

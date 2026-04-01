const BASE = "/api";

async function post(url, body) {
  const res = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

// Build a React Flow graph from a flat automata object (client-side)
export function automataToGraph(automata) {
  const { states, transitions, startState, acceptStates } = automata;
  const nodes = states.map((state, i) => ({
    id: state,
    data: { label: state, isStart: state === startState, isAccept: acceptStates.includes(state) },
    position: { x: i * 150, y: 100 },
  }));
  const edges = [];
  for (const from in transitions) {
    for (const symbol in transitions[from]) {
      const targets = transitions[from][symbol];
      const toList = Array.isArray(targets) ? targets : [targets];
      toList.forEach((to) => edges.push({ id: `${from}-${to}-${symbol}`, source: from, target: to, label: symbol }));
    }
  }
  return { nodes, edges };
}

export const regexToNFA = (regex) => post("/automata/regex-to-nfa", { regex });
export const nfaToDFA = (automata) => post("/automata/nfa-to-dfa", { automata });
export const minimizeDFA = (dfa) => post("/automata/minimize-dfa", dfa);
export const tokenize = (input) => post("/lexer/tokenize", { input });

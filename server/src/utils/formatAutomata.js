export const formatNFA = (nfa) => {
  const states = new Set();
  const alphabet = new Set();

  for (let from in nfa.transitions) {
    states.add(from);

    for (let symbol in nfa.transitions[from]) {
      if (symbol !== "ε") alphabet.add(symbol);

      nfa.transitions[from][symbol].forEach((to) => {
        states.add(to);
      });
    }
  }

  return {
    states: Array.from(states),
    alphabet: Array.from(alphabet),
    transitions: nfa.transitions,
    startState: nfa.startState,
    acceptStates: nfa.acceptStates,
  };
};

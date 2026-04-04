export const removeUnreachableStates = (nfa) => {
  const { startState, transitions } = nfa;

  const visited = new Set();
  const stack = [startState];

  while (stack.length) {
    const state = stack.pop();
    if (visited.has(state)) continue;

    visited.add(state);

    const trans = transitions[state] || {};
    for (let symbol in trans) {
      for (let next of trans[symbol]) {
        if (!visited.has(next)) stack.push(next);
      }
    }
  }

  // filter transitions
  const newTransitions = {};
  for (let state of visited) {
    newTransitions[state] = transitions[state];
  }

  return {
    ...nfa,
    states: [...visited],
    transitions: newTransitions,
  };
};

export const removeDuplicateTransitions = (nfa) => {
  const newTransitions = {};

  for (let state in nfa.transitions) {
    newTransitions[state] = {};

    for (let symbol in nfa.transitions[state]) {
      newTransitions[state][symbol] = [
        ...new Set(nfa.transitions[state][symbol]),
      ];
    }
  }

  return {
    ...nfa,
    transitions: newTransitions,
  };
};

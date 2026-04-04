export const runDFA = (dfa, input, startIndex) => {
  let state = dfa.startState;
  let i = startIndex;

  let lastAccept = null;
  let lastIndex = startIndex;

  while (i < input.length) {
    const ch = input[i];

    const next = dfa.transitions[state]?.[ch];
    if (!next) break;

    state = next;

    if (dfa.acceptStates.includes(state)) {
      lastAccept = state;
      lastIndex = i;
    }

    i++;
  }

  if (!lastAccept) return null;

  return {
    value: input.slice(startIndex, lastIndex + 1),
    nextIndex: lastIndex + 1,
  };
};

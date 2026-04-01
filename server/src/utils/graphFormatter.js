export const automataToGraph = (automata) => {
  const { states, transitions, startState, acceptStates } = automata;

  const nodes = [];
  const edges = [];

  // create nodes
  states.forEach((state, index) => {
    nodes.push({
      id: state,
      data: {
        label: state,
        isStart: state === startState,
        isAccept: acceptStates.includes(state),
      },
      position: {
        x: index * 150,
        y: 100,
      },
    });
  });

  // create edges
  for (let from in transitions) {
    for (let symbol in transitions[from]) {
      const targets = transitions[from][symbol];

      // NFA: multiple targets
      if (Array.isArray(targets)) {
        targets.forEach((to) => {
          edges.push({
            id: `${from}-${to}-${symbol}`,
            source: from,
            target: to,
            label: symbol,
          });
        });
      } else {
        // DFA: single target
        edges.push({
          id: `${from}-${targets}-${symbol}`,
          source: from,
          target: targets,
          label: symbol,
        });
      }
    }
  }

  return { nodes, edges };
};

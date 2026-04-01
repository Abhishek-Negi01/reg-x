export const minimizeDFA = (dfa) => {
  const { states, alphabet, transitions, startState, acceptStates } = dfa;

  // Step 1: Initial partition
  let partitions = [
    new Set(acceptStates),
    new Set(states.filter((s) => !acceptStates.includes(s))),
  ];

  let changed = true;

  while (changed) {
    changed = false;
    let newPartitions = [];

    for (let group of partitions) {
      let subGroups = {};

      for (let state of group) {
        let key = "";

        for (let symbol of alphabet) {
          const next = transitions[state]?.[symbol];

          // find which partition next belongs to
          let index = partitions.findIndex((p) => p.has(next));
          key += index + "|";
        }

        if (!subGroups[key]) subGroups[key] = new Set();
        subGroups[key].add(state);
      }

      const values = Object.values(subGroups);
      newPartitions.push(...values);

      if (values.length > 1) changed = true;
    }

    partitions = newPartitions;
  }

  // Step 3: Build minimized DFA
  const stateMap = {};
  partitions.forEach((group, index) => {
    for (let state of group) {
      stateMap[state] = `M${index}`;
    }
  });

  const newTransitions = {};

  partitions.forEach((group, index) => {
    const rep = [...group][0];
    const newState = `M${index}`;

    newTransitions[newState] = {};

    for (let symbol of alphabet) {
      const next = transitions[rep]?.[symbol];
      if (next) {
        newTransitions[newState][symbol] = stateMap[next];
      }
    }
  });

  const newStates = Object.values(stateMap).filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  const newStart = stateMap[startState];

  const newAccept = [...new Set(acceptStates.map((s) => stateMap[s]))];

  return {
    states: newStates,
    alphabet,
    transitions: newTransitions,
    startState: newStart,
    acceptStates: newAccept,
  };
};

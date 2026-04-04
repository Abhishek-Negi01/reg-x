export const minimizeDFA = (dfa) => {
  let { states, alphabet, transitions, startState, acceptStates } = dfa;

  //  STEP 0: REMOVE unreachable states (including dead if unused)
  const visited = new Set();
  const stack = [startState];

  while (stack.length) {
    const s = stack.pop();
    if (visited.has(s)) continue;

    visited.add(s);

    for (let sym of alphabet) {
      const next = transitions[s]?.[sym];
      if (next) stack.push(next);
    }
  }

  states = states.filter((s) => visited.has(s));

  //  STEP 1: Initial partition (REMOVE empty sets)
  let partitions = [
    new Set(acceptStates.filter((s) => states.includes(s))),
    new Set(states.filter((s) => !acceptStates.includes(s))),
  ].filter((set) => set.size > 0); // ✅ FIX

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

  //  STEP 2: Build minimized DFA (SAFE)
  const stateMap = {};
  const newTransitions = {};

  partitions.forEach((group, index) => {
    const name = `M${index}`;

    for (let state of group) {
      stateMap[state] = name;
    }
  });

  partitions.forEach((group, index) => {
    const rep = [...group][0];
    if (!rep) return; // ✅ safety

    const newState = `M${index}`;
    newTransitions[newState] = {};

    for (let symbol of alphabet) {
      const next = transitions[rep]?.[symbol];
      if (next && stateMap[next]) {
        newTransitions[newState][symbol] = stateMap[next];
      }
    }
  });

  const newStates = [...new Set(Object.values(stateMap))];
  const newStart = stateMap[startState];
  const newAccept = [
    ...new Set(acceptStates.filter((s) => stateMap[s]).map((s) => stateMap[s])),
  ];

  return {
    states: newStates,
    alphabet,
    transitions: newTransitions,
    startState: newStart,
    acceptStates: newAccept,
  };
};

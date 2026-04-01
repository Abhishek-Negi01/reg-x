// ε-closure
const epsilonClosure = (states, transitions) => {
  const stack = [...states];
  const closure = new Set(states);

  while (stack.length) {
    const state = stack.pop();

    const epsilonMoves = transitions[state]?.["ε"] || [];

    for (let next of epsilonMoves) {
      if (!closure.has(next)) {
        closure.add(next);
        stack.push(next);
      }
    }
  }

  return closure;
};

// move function
const move = (states, symbol, transitions) => {
  const result = new Set();

  for (let state of states) {
    const moves = transitions[state]?.[symbol] || [];
    moves.forEach((s) => result.add(s));
  }

  return result;
};

export const nfaToDFA = (nfa) => {
  const { alphabet, transitions, startState, acceptStates } = nfa;

  const dfaStates = [];
  const dfaTransitions = {};
  const dfaAcceptStates = [];

  const stateMap = new Map(); // set → name
  let stateCount = 0;

  const getStateName = (set) => {
    const key = [...set].sort().join(",");
    if (!stateMap.has(key)) {
      stateMap.set(key, `D${stateCount++}`);
    }
    return stateMap.get(key);
  };

  // start state
  const startClosure = epsilonClosure([startState], transitions);
  const startName = getStateName(startClosure);

  const queue = [startClosure];
  const visited = new Set();

  while (queue.length) {
    const currentSet = queue.shift();
    const currentName = getStateName(currentSet);

    if (visited.has(currentName)) continue;
    visited.add(currentName);

    dfaTransitions[currentName] = {};

    for (let symbol of alphabet) {
      const moved = move(currentSet, symbol, transitions);
      const closure = epsilonClosure([...moved], transitions);

      if (closure.size === 0) continue;

      const nextName = getStateName(closure);

      dfaTransitions[currentName][symbol] = nextName;

      queue.push(closure);
    }
  }

  // states
  const states = Array.from(stateMap.values());

  // accept states
  for (let [setStr, name] of stateMap.entries()) {
    const set = new Set(setStr.split(","));
    for (let acc of acceptStates) {
      if (set.has(acc)) {
        dfaAcceptStates.push(name);
        break;
      }
    }
  }

  return {
    states,
    alphabet,
    transitions: dfaTransitions,
    startState: startName,
    acceptStates: dfaAcceptStates,
  };
};

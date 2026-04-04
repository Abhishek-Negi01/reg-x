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

// move
const move = (states, symbol, transitions) => {
  const result = new Set();

  for (let state of states) {
    const moves = [];

    // normal match
    if (transitions[state]?.[symbol]) {
      moves.push(...transitions[state][symbol]);
    }

    //  char class match
    for (let key in transitions[state] || {}) {
      if (key.startsWith("[") && key.endsWith("]")) {
        const chars = key.slice(1, -1);

        // check ranges
        for (let i = 0; i < chars.length; i++) {
          if (chars[i + 1] === "-") {
            const start = chars.charCodeAt(i);
            const end = chars.charCodeAt(i + 2);

            if (symbol.charCodeAt(0) >= start && symbol.charCodeAt(0) <= end) {
              moves.push(...transitions[state][key]);
            }

            i += 2;
          } else {
            if (chars[i] === symbol) {
              moves.push(...transitions[state][key]);
            }
          }
        }
      }
    }
    moves.forEach((s) => result.add(s));
  }

  return result;
};

export const nfaToDFA = (nfa) => {
  const { transitions, startState, acceptStates } = nfa;

  const alphabetSet = new Set();

  for (let state in transitions) {
    for (let symbol in transitions[state]) {
      if (symbol === "ε") continue;

      // expand char class
      if (symbol.startsWith("[") && symbol.endsWith("]")) {
        const chars = symbol.slice(1, -1);

        for (let i = 0; i < chars.length; i++) {
          if (chars[i + 1] === "-") {
            const start = chars.charCodeAt(i);
            const end = chars.charCodeAt(i + 2);

            for (let c = start; c <= end; c++) {
              alphabetSet.add(String.fromCharCode(c));
            }

            i += 2;
          } else {
            alphabetSet.add(chars[i]);
          }
        }
      } else {
        alphabetSet.add(symbol);
      }
    }
  }

  const alphabet = [...alphabetSet];

  const dfaTransitions = {};
  const dfaAcceptStates = [];

  const stateMap = new Map();
  let stateCount = 0;

  const getStateName = (set) => {
    const key = [...set].sort().join(",");
    if (!stateMap.has(key)) {
      stateMap.set(key, `D${stateCount++}`);
    }
    return stateMap.get(key);
  };

  const DEAD = "D_dead";

  // start
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

      let nextName;

      if (closure.size === 0) {
        nextName = DEAD;
      } else {
        nextName = getStateName(closure);

        if (!visited.has(nextName)) {
          queue.push(closure);
        }
      }

      dfaTransitions[currentName][symbol] = nextName;
    }
  }

  // DEAD state transitions
  dfaTransitions[DEAD] = {};
  for (let symbol of alphabet) {
    dfaTransitions[DEAD][symbol] = DEAD;
  }

  // states
  const states = Array.from(stateMap.values());
  states.push(DEAD);

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

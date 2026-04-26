export const computeFirst = (grammar) => {
  const FIRST = {};

  for (let nt in grammar) {
    FIRST[nt] = new Set();
  }

  const isTerminal = (symbol) => {
    return !grammar[symbol] && symbol !== "ε";
  };

  let changed = true;

  while (changed) {
    changed = false;

    for (let nt in grammar) {
      for (let production of grammar[nt]) {
        let canHaveEpsilon = true;

        for (let symbol of production) {
          if (isTerminal(symbol)) {
            if (!FIRST[nt].has(symbol)) {
              FIRST[nt].add(symbol);
              changed = true;
            }
            canHaveEpsilon = false;
            break;
          }

          if (symbol === "ε") {
            if (!FIRST[nt].has("ε")) {
              FIRST[nt].add("ε");
              changed = true;
            }
            canHaveEpsilon = false;
            break;
          }

          for (let val of FIRST[symbol]) {
            if (val !== "ε" && !FIRST[nt].has(val)) {
              FIRST[nt].add(val);
              changed = true;
            }
          }

          if (!FIRST[symbol].has("ε")) {
            canHaveEpsilon = false;
            break;
          }
        }

        if (canHaveEpsilon) {
          if (!FIRST[nt].has("ε")) {
            FIRST[nt].add("ε");
            changed = true;
          }
        }
      }
    }
  }

  // 🔥 convert Set → Array for API
  const result = {};
  for (let nt in FIRST) {
    result[nt] = Array.from(FIRST[nt]);
  }

  return result;
};

export const computeFollow = (grammar, FIRST, startSymbol) => {
  const FOLLOW = {};

  // initialize
  for (let nt in grammar) {
    FOLLOW[nt] = new Set();
  }

  // rule 1: add $ to start symbol
  FOLLOW[startSymbol].add("$");

  let changed = true;

  while (changed) {
    changed = false;

    for (let A in grammar) {
      for (let production of grammar[A]) {
        for (let i = 0; i < production.length; i++) {
          const B = production[i];

          if (!grammar[B]) continue; // skip terminals

          let canPassFollow = true;

          // check symbols after B
          for (let j = i + 1; j < production.length; j++) {
            const next = production[j];

            // terminal
            if (!grammar[next]) {
              if (!FOLLOW[B].has(next)) {
                FOLLOW[B].add(next);
                changed = true;
              }
              canPassFollow = false;
              break;
            }

            // add FIRST(next) - ε
            for (let val of FIRST[next]) {
              if (val !== "ε" && !FOLLOW[B].has(val)) {
                FOLLOW[B].add(val);
                changed = true;
              }
            }

            if (!FIRST[next].includes("ε")) {
              canPassFollow = false;
              break;
            }
          }

          // if at end OR ε chain
          if (canPassFollow) {
            for (let val of FOLLOW[A]) {
              if (!FOLLOW[B].has(val)) {
                FOLLOW[B].add(val);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  // convert Set → Array
  const result = {};
  for (let nt in FOLLOW) {
    result[nt] = Array.from(FOLLOW[nt]);
  }

  return result;
};

export const buildParsingTable = (grammar, FIRST, FOLLOW) => {
  const table = {};

  for (let A in grammar) {
    table[A] = {};
  }

  const getFirstOfString = (symbols) => {
    const result = new Set();

    for (let symbol of symbols) {
      // terminal
      if (!grammar[symbol]) {
        result.add(symbol);
        return result;
      }

      // add FIRST(symbol) - ε
      for (let val of FIRST[symbol]) {
        if (val !== "ε") result.add(val);
      }

      if (!FIRST[symbol].includes("ε")) {
        return result;
      }
    }

    result.add("ε");
    return result;
  };

  for (let A in grammar) {
    for (let production of grammar[A]) {
      const firstSet = getFirstOfString(production);

      for (let terminal of firstSet) {
        if (terminal !== "ε") {
          table[A][terminal] = production;
        }
      }

      // ε case → use FOLLOW
      if (firstSet.has("ε")) {
        for (let b of FOLLOW[A]) {
          table[A][b] = ["ε"];
        }
      }
    }
  }

  return table;
};

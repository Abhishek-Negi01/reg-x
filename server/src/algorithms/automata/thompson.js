let stateCount = 0;

const newState = () => `q${stateCount++}`;

// basic fragment for symbol
const createSymbolNFA = (symbol) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { [symbol]: [end] },
    },
  };
};

// concatenate
const concatenate = (nfa1, nfa2) => {
  nfa1.transitions[nfa1.end] = { ε: [nfa2.start] };

  return {
    start: nfa1.start,
    end: nfa2.end,
    transitions: { ...nfa1.transitions, ...nfa2.transitions },
  };
};

// union (|)
const union = (nfa1, nfa2) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { ε: [nfa1.start, nfa2.start] },
      ...nfa1.transitions,
      ...nfa2.transitions,
      [nfa1.end]: { ε: [end] },
      [nfa2.end]: { ε: [end] },
    },
  };
};

// Kleene star (*)
const kleene = (nfa) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { ε: [nfa.start, end] },
      ...nfa.transitions,
      [nfa.end]: { ε: [nfa.start, end] },
    },
  };
};

const plus = (nfa) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { ε: [nfa.start] },
      ...nfa.transitions,
      [nfa.end]: { ε: [nfa.start, end] },
    },
  };
};

const optional = (nfa) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { ε: [nfa.start, end] },
      ...nfa.transitions,
      [nfa.end]: { ε: [end] },
    },
  };
};
import {
  tokenizeRegex,
  addConcat,
  toPostfix,
  expandCharClass,
} from "./regexParser.js";

export const regexToNFA = (regex) => {
  stateCount = 0;

  const tokens = tokenizeRegex(regex);
  const withConcat = addConcat(tokens);
  const postfix = toPostfix(withConcat);

  // console.log("Postfix:", postfix); // debug

  const stack = [];

  for (let token of postfix) {
    if (token.type === "LITERAL") {
      stack.push(createSymbolNFA(token.value));
    } else if (token.type === "CHAR_CLASS") {
      stack.push(createCharClassNFA(token.value)); //  no expansion
    } else {
      const op = token.value;

      if (op === "*") stack.push(kleene(stack.pop()));
      else if (op === "+") stack.push(plus(stack.pop()));
      else if (op === "?") stack.push(optional(stack.pop()));
      else if (op === ".") {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(concatenate(a, b));
      } else if (op === "|") {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(union(a, b));
      }
    }
  }

  const result = stack.pop();

  return {
    startState: result.start,
    acceptStates: [result.end],
    transitions: result.transitions,
  };
};

const createCharClassNFA = (charClass) => {
  const start = newState();
  const end = newState();

  return {
    start,
    end,
    transitions: {
      [start]: { [charClass]: [end] }, //  single transition
    },
  };
};

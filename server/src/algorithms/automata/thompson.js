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

// MAIN FUNCTION (very basic parsing for now)
import { addConcatOperator, infixToPostfix } from "./regexParser.js";

export const regexToNFA = (regex) => {
  stateCount = 0;

  const withConcat = addConcatOperator(regex);
  const postfix = infixToPostfix(withConcat);

  console.log("Postfix:", postfix); // debug

  const stack = [];

  for (let char of postfix) {
    if (char === "*") {
      stack.push(kleene(stack.pop()));
    } else if (char === ".") {
      const nfa2 = stack.pop();
      const nfa1 = stack.pop();
      stack.push(concatenate(nfa1, nfa2));
    } else if (char === "|") {
      const nfa2 = stack.pop();
      const nfa1 = stack.pop();
      stack.push(union(nfa1, nfa2));
    } else {
      stack.push(createSymbolNFA(char));
    }
  }

  const result = stack.pop();

  return {
    startState: result.start,
    acceptStates: [result.end],
    transitions: result.transitions,
  };
};

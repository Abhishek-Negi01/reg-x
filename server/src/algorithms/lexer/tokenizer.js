import { simulateLexerDFA } from "./dfaSimulator.js";

export const tokenize = (input) => {
  const KEYWORDS = ["if", "else", "while", "return"];
  let tokens = [];
  let allSteps = [];
  let errors = [];
  let i = 0;

  while (i < input.length) {
    let ch = input[i];

    if (ch === " ") {
      i++;
      continue;
    }

    const result = simulateLexerDFA(input, i);

    if (result) {
      tokens.push({
        type: KEYWORDS.includes(result.value) ? "KEYWORD" : "IDENTIFIER",
        value: result.value,
      });

      allSteps.push({
        token: result.value,
        steps: result.steps,
      });

      i = result.nextIndex;
      continue;
    }

    // operators
    if (ch === "+") {
      tokens.push({ type: "PLUS", value: "+" });
      i++;
      continue;
    }

    if (ch === "*") {
      tokens.push({ type: "MULTIPLY", value: "*" });
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    // tokens.push({ type: "UNKNOWN", value: ch });
    tokens.push({
      type: "ERROR",
      value: ch,
      position: i,
    });

    errors.push({
      message: "Invalid character",
      value: ch,
      position: i,
    });

    i++;
  }

  return {
    success: errors.length === 0,
    tokens,
    steps: allSteps,
    errors,
  };
};

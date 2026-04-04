import { buildTokenDFAs } from "./buildTokenDFAs.js";
import { runDFA } from "./dfaSimulator.js";

const TOKEN_DFAS = buildTokenDFAs();

export const tokenize = (input) => {
  let tokens = [];
  let errors = [];
  let i = 0;

  while (i < input.length) {
    let ch = input[i];

    // skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    let bestMatch = null;

    for (let token of TOKEN_DFAS) {
      const result = runDFA(token.dfa, input, i);

      if (result) {
        if (
          !bestMatch ||
          result.value.length > bestMatch.value.length ||
          (result.value.length === bestMatch.value.length &&
            token.priority < bestMatch.priority)
        ) {
          bestMatch = {
            type: token.type,
            value: result.value,
            nextIndex: result.nextIndex,
            priority: token.priority,
          };
        }
      }
    }

    if (bestMatch) {
      tokens.push({
        type: bestMatch.type,
        value: bestMatch.value,
      });

      i = bestMatch.nextIndex;
      continue;
    }

    //  error
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
    errors,
  };
};

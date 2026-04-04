export const addConcat = (tokens) => {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];

    result.push(curr);

    if (!next) continue;

    const isCurr =
      curr.type === "LITERAL" ||
      curr.type === "CHAR_CLASS" ||
      curr.value === ")" ||
      ["*", "+", "?"].includes(curr.value);

    const isNext =
      next.type === "LITERAL" ||
      next.type === "CHAR_CLASS" ||
      next.value === "(";

    if (isCurr && isNext) {
      result.push({ type: "OPERATOR", value: "." });
    }
  }

  return result;
};

const precedence = {
  "*": 3,
  "+": 3,
  "?": 3,
  ".": 2,
  "|": 1,
};

export const toPostfix = (tokens) => {
  let output = [];
  let stack = [];

  for (let token of tokens) {
    if (token.type === "LITERAL" || token.type === "CHAR_CLASS") {
      output.push(token);
    } else if (token.value === "(") {
      stack.push(token);
    } else if (token.value === ")") {
      while (stack.length && stack.at(-1).value !== "(") {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      while (
        stack.length &&
        precedence[stack.at(-1).value] >= precedence[token.value]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  }

  while (stack.length) output.push(stack.pop());

  return output;
};

export const expandCharClass = (token) => {
  const str = token.value;
  let result = [];

  let i = 1;
  while (i < str.length - 1) {
    if (str[i + 1] === "-") {
      let start = str.charCodeAt(i);
      let end = str.charCodeAt(i + 2);

      for (let c = start; c <= end; c++) {
        result.push(String.fromCharCode(c));
      }

      i += 3;
    } else {
      result.push(str[i]);
      i++;
    }
  }

  return result;
};

// 🔥 TOKENIZER
export const tokenizeRegex = (regex) => {
  const tokens = [];

  for (let i = 0; i < regex.length; i++) {
    let ch = regex[i];

    if (ch === "\\") {
      tokens.push({ type: "LITERAL", value: regex[i + 1] });
      i++;
      continue;
    }

    if (ch === "[") {
      let j = i;
      while (regex[j] !== "]") j++;

      tokens.push({
        type: "CHAR_CLASS",
        value: regex.slice(i, j + 1),
      });

      i = j;
      continue;
    }

    if ("|*+?()".includes(ch)) {
      tokens.push({ type: "OPERATOR", value: ch });
    } else {
      tokens.push({ type: "LITERAL", value: ch });
    }
  }

  return tokens;
};

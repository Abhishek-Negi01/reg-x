export const addConcatOperator = (regex) => {
  let result = "";

  for (let i = 0; i < regex.length; i++) {
    const curr = regex[i];
    const next = regex[i + 1];

    result += curr;

    if (
      curr !== "(" &&
      curr !== "|" &&
      next &&
      next !== ")" &&
      next !== "|" &&
      next !== "*"
    ) {
      result += ".";
    }
  }

  return result;
};

const precedence = {
  "*": 3,
  ".": 2,
  "|": 1,
};

export const infixToPostfix = (regex) => {
  let output = "";
  let stack = [];

  for (let char of regex) {
    if (/^[a-zA-Z0-9]$/.test(char)) {
      output += char;
    } else if (char === "(") {
      stack.push(char);
    } else if (char === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") {
        output += stack.pop();
      }
      stack.pop();
    } else {
      while (
        stack.length &&
        precedence[stack[stack.length - 1]] >= precedence[char]
      ) {
        output += stack.pop();
      }
      stack.push(char);
    }
  }

  while (stack.length) {
    output += stack.pop();
  }

  return output;
};

class Node {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
}

export const parseLL1 = (tokens, table, startSymbol) => {
  // convert tokens → values + end marker
  const input = [...tokens.map((t) => t.value), "$"];

  // parsing stack
  const stack = ["$", startSymbol];

  // root of parse tree
  const root = new Node(startSymbol);

  // 🔥 synchronized stack (1:1 with parsing stack)
  const nodeStack = [new Node("$"), root];

  let i = 0;
  const steps = [];

  while (stack.length) {
    const top = stack.pop();
    const node = nodeStack.pop();
    const current = input[i];

    if (!node) {
      return {
        success: false,
        error: "Parser stack mismatch",
        steps,
      };
    }

    steps.push({
      stack: [...stack, top],
      input: input.slice(i),
      action: "",
    });

    // ✅ match terminal
    if (top === current) {
      steps.at(-1).action = `match ${current}`;

      // attach terminal node
      node.children.push(new Node(current));

      i++;
      continue;
    }

    // ✅ epsilon
    if (top === "ε") {
      steps.at(-1).action = "epsilon";
      node.children.push(new Node("ε"));
      continue;
    }

    // ✅ non-terminal
    if (table[top]) {
      const production = table[top][current];

      if (!production) {
        return {
          success: false,
          error: "Syntax error",
          details: {
            nonTerminal: top,
            expected: Object.keys(table[top]),
            got: current,
            position: i,
          },
          steps,
        };
      }

      steps.at(-1).action = `${top} → ${production.join(" ")}`;

      const children = [];

      // push production in reverse
      for (let j = production.length - 1; j >= 0; j--) {
        const sym = production[j];

        stack.push(sym);

        const childNode = new Node(sym);
        nodeStack.push(childNode);

        children.unshift(childNode);
      }

      node.children = children;
    } else {
      return {
        success: false,
        error: "Unexpected symbol",
        details: {
          symbol: top,
          input: current,
          position: i,
        },
        steps,
      };
    }
  }

  // final validation
  if (i !== input.length) {
    return {
      success: false,
      error: "Input not fully consumed",
      details: {
        remainingInput: input.slice(i),
        position: i,
      },
      steps,
    };
  }

  return {
    success: true,
    tree: root,
    steps,
  };
};

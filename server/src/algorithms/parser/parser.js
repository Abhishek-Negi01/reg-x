class Node {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
}

export const parse = (tokens) => {
  let i = 0;

  const peek = () => tokens[i];
  const isAtEnd = () => i >= tokens.length;

  const match = (type) => {
    if (peek()?.type === type) {
      return tokens[i++];
    }
    throw new Error(`Expected ${type}, got ${peek()?.type}`);
  };

  // E → T E'
  const E = () => {
    const node = new Node("E");
    node.children.push(T());
    node.children.push(Eprime());
    return node;
  };

  // E' → + T E' | ε
  const Eprime = () => {
    const node = new Node("E'");

    if (peek()?.type === "PLUS") {
      node.children.push(new Node(match("PLUS").value));
      node.children.push(T());
      node.children.push(Eprime());
    } else {
      node.children.push(new Node("ε"));
    }

    return node;
  };

  // T → F T'
  const T = () => {
    const node = new Node("T");
    node.children.push(F());
    node.children.push(Tprime());
    return node;
  };

  // T' → * F T' | ε
  const Tprime = () => {
    const node = new Node("T'");

    if (peek()?.type === "MULTIPLY") {
      node.children.push(new Node(match("MULTIPLY").value));
      node.children.push(F());
      node.children.push(Tprime());
    } else {
      node.children.push(new Node("ε"));
    }

    return node;
  };

  // F → ( E ) | id | number
  const F = () => {
    const node = new Node("F");

    if (peek()?.type === "LPAREN") {
      match("LPAREN");
      node.children.push(E());
      match("RPAREN");
    } else if (peek()?.type === "IDENTIFIER") {
      node.children.push(new Node(match("IDENTIFIER").value));
    } else if (peek()?.type === "NUMBER") {
      node.children.push(new Node(match("NUMBER").value));
    } else {
      throw new Error(`Invalid syntax at ${peek()?.value}`);
    }

    return node;
  };

  try {
    const tree = E();

    //  ensure full input consumed
    if (!isAtEnd()) {
      throw new Error("Unexpected extra input");
    }

    return {
      success: true,
      tree,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
};

export const mapTokensToGrammar = (tokens) => {
  return tokens.map((t) => {
    switch (t.type) {
      case "IDENTIFIER":
        return { value: "id" };

      case "NUMBER":
        return { value: "id" }; // grammar uses id for both

      case "PLUS":
        return { value: "+" };

      case "MULTIPLY":
        return { value: "*" };

      case "LPAREN":
        return { value: "(" };

      case "RPAREN":
        return { value: ")" };

      default:
        return { value: t.value };
    }
  });
};

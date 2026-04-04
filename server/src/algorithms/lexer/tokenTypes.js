export const TOKEN_REGEX = [
  //  keywords FIRST (higher priority)
  { type: "KEYWORD", regex: "if|else|while|return|int|float|main" },

  // identifiers
  { type: "IDENTIFIER", regex: "[a-zA-Z][a-zA-Z0-9]*" },

  // numbers
  { type: "NUMBER", regex: "[0-9]+(\\.[0-9]+)?" },

  // operators
  { type: "PLUS", regex: "\\+" },
  { type: "MULTIPLY", regex: "\\*" },
  { type: "ASSIGN", regex: "=" },

  // symbols
  { type: "LPAREN", regex: "\\(" },
  { type: "RPAREN", regex: "\\)" },
  { type: "LBRACE", regex: "\\{" },
  { type: "RBRACE", regex: "\\}" },

  { type: "SEMICOLON", regex: ";" },
  { type: "COMMA", regex: "," },
];

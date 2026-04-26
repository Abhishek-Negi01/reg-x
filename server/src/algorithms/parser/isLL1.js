export const isLL1Grammar = (table) => {
  for (let nonTerminal in table) {
    for (let terminal in table[nonTerminal]) {
      const production = table[nonTerminal][terminal];

      // conflict if multiple productions
      if (Array.isArray(production) && Array.isArray(production[0])) {
        return {
          isLL1: false,
          conflict: {
            nonTerminal,
            terminal,
            productions: production,
          },
        };
      }
    }
  }

  return { isLL1: true };
};

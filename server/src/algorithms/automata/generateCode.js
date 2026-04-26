export const generateCodeFromDFA = (dfa) => {
  const { transitions, startState, acceptStates } = dfa;

  let code = `const acceptSet = new Set(${JSON.stringify(acceptStates)});
  
  function recognize(input) {
    let state = "${startState}";
  
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
  
      switch(state) {
  `;

  for (let state in transitions) {
    code += `      case "${state}":
          switch(ch) {
  `;

    for (let symbol in transitions[state]) {
      code += `          case "${symbol}": state = "${transitions[state][symbol]}"; break;
  `;
    }

    code += `          default: return false;
          }
          break;
  `;
  }

  code += `      default:
          return false;
      }
    }
  
    return acceptSet.has(state);
  }
  `;

  return code;
};

const isLetter = (ch) => /[a-zA-Z]/.test(ch);
const isDigit = (ch) => /[0-9]/.test(ch);

export const simulateLexerDFA = (input, startIndex) => {
  let state = "q0";
  let i = startIndex;

  let lastAcceptState = null;
  let lastAcceptIndex = startIndex;

  const steps = [];

  while (i < input.length) {
    const ch = input[i];
    let prevState = state;

    if (state === "q0") {
      if (isLetter(ch)) state = "q1";
      else if (isDigit(ch)) state = "q2";
      else break;
    } else if (state === "q1") {
      if (isLetter(ch)) state = "q1";
      else break;
    } else if (state === "q2") {
      if (isDigit(ch)) state = "q2";
      else break;
    }

    // record step
    steps.push({
      char: ch,
      from: prevState,
      to: state,
    });

    // accepting states
    if (state === "q1" || state === "q2") {
      lastAcceptState = state;
      lastAcceptIndex = i;
    }

    i++;
  }

  if (!lastAcceptState) return null;

  const value = input.slice(startIndex, lastAcceptIndex + 1);

  return {
    type: lastAcceptState === "q1" ? "IDENTIFIER" : "NUMBER",
    value,
    nextIndex: lastAcceptIndex + 1,
    steps,
  };
};

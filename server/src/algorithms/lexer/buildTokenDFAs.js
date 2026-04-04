import { TOKEN_REGEX } from "./tokenTypes.js";
import { regexToNFA } from "../automata/thompson.js";
import { formatNFA } from "../../utils/formatAutomata.js";
import { nfaToDFA } from "../automata/subset.js";
import { minimizeDFA } from "../automata/minimizeDFA.js";

export const buildTokenDFAs = () => {
  return TOKEN_REGEX.map((token, index) => {
    let nfa = regexToNFA(token.regex);
    nfa = formatNFA(nfa);

    let dfa = nfaToDFA(nfa);
    let minDFA = minimizeDFA(dfa);

    return {
      type: token.type,
      dfa: minDFA,
      priority: index, //  important
    };
  });
};

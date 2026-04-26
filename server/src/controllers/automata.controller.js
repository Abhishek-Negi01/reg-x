import { regexToNFA } from "../algorithms/automata/thompson.js";
import { formatNFA } from "../utils/formatAutomata.js";
import { nfaToDFA } from "../algorithms/automata/subset.js";
import {
  removeUnreachableStates,
  removeDuplicateTransitions,
} from "../algorithms/automata/optimizeNFA.js";

export const testAutomata = (req, res) => {
  res.status(200).json({
    message: "Automata route working",
  });
};

import { automataToGraph } from "../utils/graphFormatter.js";

export const convertRegex = (req, res) => {
  const { regex } = req.body;

  let nfa = regexToNFA(regex);
  nfa = removeUnreachableStates(nfa);
  nfa = removeDuplicateTransitions(nfa);

  const formatted = formatNFA(nfa);
  const graph = automataToGraph(formatted);

  res.json({
    automata: formatted,
    graph,
  });
};

export const convertToDFA = (req, res) => {
  const nfa = req.body.automata || req.body;

  if (!nfa || !nfa.transitions) {
    return res.status(400).json({ error: "Invalid NFA input" });
  }

  const dfa = nfaToDFA(nfa);

  res.json(dfa);
};

import { minimizeDFA } from "../algorithms/automata/minimizeDFA.js";

export const minimize = (req, res) => {
  const dfa = req.body;

  const minimized = minimizeDFA(dfa);

  res.json(minimized);
};

import { generateCodeFromDFA } from "../algorithms/automata/generateCode.js";

export const generateCode = (req, res) => {
  const dfa = req.body;

  if (!dfa || !dfa.transitions) {
    return res.status(400).json({ error: "Invalid DFA" });
  }

  const code = generateCodeFromDFA(dfa);

  res.json({
    success: true,
    code,
  });
};

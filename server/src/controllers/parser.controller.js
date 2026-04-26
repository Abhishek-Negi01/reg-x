import { parse } from "../algorithms/parser/parser.js";
import { parseLL1 } from "../algorithms/parser/ll1Parser.js";

import {
  buildParsingTable,
  computeFirst,
  computeFollow,
} from "../algorithms/parser/firstFollow.js";

import { isLL1Grammar } from "../algorithms/parser/isLL1.js";

import { mapTokensToGrammar } from "../algorithms/parser/tokenMapper.js";

// =======================
// BASIC PARSE TREE (OLD)
// =======================
export const generateParseTree = (req, res) => {
  try {
    const { tokens } = req.body;

    const filteredTokens = tokens
      .filter((t) => t.type !== "ERROR")
      .map((t) => ({
        ...t,
        type: t.type === "KEYWORD" ? "IDENTIFIER" : t.type,
      }));

    const tree = parse(filteredTokens);

    res.json(tree);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// FIRST
// =======================
export const getFirst = (req, res) => {
  const { grammar } = req.body;

  if (!grammar) {
    return res.status(400).json({ error: "Grammar required" });
  }

  const first = computeFirst(grammar);

  res.json({
    success: true,
    first,
  });
};

// =======================
// FOLLOW
// =======================
export const getFollow = (req, res) => {
  const { grammar, startSymbol } = req.body;

  if (!grammar || !startSymbol) {
    return res.status(400).json({
      error: "Grammar and startSymbol required",
    });
  }

  const first = computeFirst(grammar);
  const follow = computeFollow(grammar, first, startSymbol);

  res.json({
    success: true,
    follow,
  });
};

// =======================
// PARSING TABLE + LL1 CHECK
// =======================
export const getParsingTable = (req, res) => {
  const { grammar, startSymbol } = req.body;

  if (!grammar || !startSymbol) {
    return res.status(400).json({
      error: "Grammar and startSymbol required",
    });
  }

  const first = computeFirst(grammar);
  const follow = computeFollow(grammar, first, startSymbol);
  const table = buildParsingTable(grammar, first, follow);

  // 🔥 NEW: LL1 VALIDATION
  const check = isLL1Grammar(table);

  res.json({
    success: true,
    table,
    isLL1: check.isLL1,
    conflict: check.conflict || null,
  });
};

// =======================
// LL(1) PARSER
// =======================
export const parseWithTable = (req, res) => {
  const { tokens, grammar, startSymbol } = req.body;

  if (!tokens || !grammar || !startSymbol) {
    return res.status(400).json({
      error: "tokens, grammar, startSymbol required",
    });
  }

  const first = computeFirst(grammar);
  const follow = computeFollow(grammar, first, startSymbol);
  const table = buildParsingTable(grammar, first, follow);

  // 🔥 check LL(1) before parsing
  const check = isLL1Grammar(table);

  if (!check.isLL1) {
    return res.status(400).json({
      success: false,
      error: "Grammar is not LL(1)",
      conflict: check.conflict,
    });
  }

  // 🔥 token mapping (IMPORTANT)
  const mappedTokens = tokens.map((t) => {
    if (t.type === "IDENTIFIER") return { value: "id" };
    if (t.type === "NUMBER") return { value: "id" };
    return { value: t.value };
  });

  const result = parseLL1(mappedTokens, table, startSymbol);

  res.json(result);
};

export const fullParserPipeline = (req, res) => {
  const { tokens, grammar, startSymbol } = req.body;

  if (!tokens || !grammar || !startSymbol) {
    return res.status(400).json({
      error: "tokens, grammar, startSymbol required",
    });
  }

  try {
    // STEP 1: FIRST
    const first = computeFirst(grammar);

    // STEP 2: FOLLOW
    const follow = computeFollow(grammar, first, startSymbol);

    // STEP 3: TABLE
    const table = buildParsingTable(grammar, first, follow);

    // STEP 4: LL(1) CHECK
    const check = isLL1Grammar(table);

    if (!check.isLL1) {
      return res.status(400).json({
        success: false,
        stage: "LL1_CHECK",
        error: "Grammar is not LL(1)",
        conflict: check.conflict,
      });
    }

    // STEP 5: TOKEN MAPPING

    const mappedTokens = mapTokensToGrammar(tokens);

    // STEP 6: PARSE
    const parseResult = parseLL1(mappedTokens, table, startSymbol);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        stage: "PARSING",
        error: parseResult.error,
        steps: parseResult.steps,
      });
    }

    // ✅ FINAL RESPONSE
    res.json({
      success: true,
      first,
      follow,
      table,
      parseTree: parseResult.tree,
      steps: parseResult.steps,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

import { parse } from "../algorithms/parser/parser.js";

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

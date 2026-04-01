import { tokenize } from "../algorithms/lexer/tokenizer.js";

export const runLexer = (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    const result = tokenize(input);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

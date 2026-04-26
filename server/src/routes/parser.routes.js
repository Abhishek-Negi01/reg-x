import express from "express";
const router = express.Router();

import {
  generateParseTree,
  getFirst,
  getFollow,
  getParsingTable,
  parseWithTable,
  fullParserPipeline,
} from "../controllers/parser.controller.js";

router.post("/parse-tree", generateParseTree);

router.post("/first", getFirst);

router.post("/follow", getFollow);

router.post("/parsing-table", getParsingTable);

router.post("/parse-ll1", parseWithTable);

router.post("/full", fullParserPipeline);

export default router;

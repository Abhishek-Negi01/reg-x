import express from "express";
const router = express.Router();

import { generateParseTree } from "../controllers/parser.controller.js";

router.post("/parse-tree", generateParseTree);

export default router;

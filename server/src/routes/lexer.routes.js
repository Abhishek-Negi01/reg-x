import { Router } from "express";

const router = Router();

import { runLexer } from "../controllers/lexer.controller.js";

router.post("/tokenize", runLexer);

export default router;

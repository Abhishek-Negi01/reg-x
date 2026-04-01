import { Router } from "express";

import {
  testAutomata,
  convertRegex,
  convertToDFA,
  minimize,
} from "../controllers/automata.controller.js";

const router = Router();

router.get("/test", testAutomata);
router.post("/regex-to-nfa", convertRegex);
router.post("/nfa-to-dfa", convertToDFA);
router.post("/minimize-dfa", minimize);

export default router;

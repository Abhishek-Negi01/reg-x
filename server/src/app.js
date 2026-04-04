import express from "express";
import cors from "cors";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// Routes
import automataRoutes from "./routes/automata.routes.js";
import lexerRoutes from "./routes/lexer.routes.js";
import parserRoutes from "./routes/parser.routes.js";

app.use("/api/automata", automataRoutes);
app.use("/api/lexer", lexerRoutes);

app.use("/api/parser", parserRoutes);

export default app;

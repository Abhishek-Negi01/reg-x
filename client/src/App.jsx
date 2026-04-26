import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AutomataPage from "./pages/AutomataPage";
import LexerPage from "./pages/LexerPage";
import ParserPage from "./pages/ParserPage";
import FullParserPage from "./pages/FullParserPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0B0F17" }}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/automata" replace />} />
            <Route path="/automata" element={<AutomataPage />} />
            <Route path="/lexer" element={<LexerPage />} />
            <Route path="/parser" element={<ParserPage />} />
            <Route path="/ll1" element={<FullParserPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

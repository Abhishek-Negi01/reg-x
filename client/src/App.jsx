import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AutomataPage from "./pages/AutomataPage";
import LexerPage from "./pages/LexerPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/automata" replace />} />
            <Route path="/automata" element={<AutomataPage />} />
            <Route path="/lexer" element={<LexerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

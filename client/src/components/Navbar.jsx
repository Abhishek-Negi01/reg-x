import { NavLink } from "react-router-dom";

export default function Navbar() {
  const link = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
      <span className="text-white font-bold text-lg tracking-tight">
        Reg<span className="text-indigo-400">-X</span>
      </span>
      <div className="flex gap-2">
        <NavLink to="/automata" className={link}>Automata</NavLink>
        <NavLink to="/lexer" className={link}>Lexer</NavLink>
      </div>
    </nav>
  );
}

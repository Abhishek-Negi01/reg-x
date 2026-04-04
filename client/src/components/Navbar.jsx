import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const LINKS = [
  { to: "/automata", label: "Automata" },
  { to: "/lexer",    label: "Lexer"    },
  { to: "/parser",   label: "Parser"   },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#111827",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        maxWidth: 1120, margin: "0 auto", padding: "0 24px",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800, fontSize: 18, letterSpacing: "-0.04em",
            color: "#F9FAFB",
          }}>
            Reg<span style={{ color: "#818CF8" }}>-X</span>
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
            color: "#6B7280", textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "2px 6px", borderRadius: 4,
            fontFamily: "Inter, sans-serif",
          }}>Compiler</span>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden sm:flex">
          {LINKS.map(({ to, label }) => {
            const active = pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} style={{ textDecoration: "none" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 16px", borderRadius: 8,
                  fontSize: 13.5, fontWeight: 600,
                  color: active ? "#F9FAFB" : "#9CA3AF",
                  background: active ? "#1F2937" : "transparent",
                  border: `1px solid ${active ? "rgba(255,255,255,0.1)" : "transparent"}`,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#E5E7EB"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "transparent"; }}}
                >
                  {label}
                  {active && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#818CF8" }} />}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button className="sm:hidden" onClick={() => setOpen(o => !o)} style={{
          background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 7, color: "#9CA3AF",
          fontSize: 15, cursor: "pointer", padding: "6px 10px",
        }}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden anim-fade-in" style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "#111827", padding: "8px 16px 14px",
        }}>
          {LINKS.map(({ to, label }) => {
            const active = pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} style={{ textDecoration: "none", display: "block" }}>
                <span style={{
                  display: "flex", alignItems: "center",
                  padding: "11px 14px", borderRadius: 8, marginBottom: 3,
                  fontSize: 14, fontWeight: 600,
                  color: active ? "#F9FAFB" : "#9CA3AF",
                  background: active ? "#1F2937" : "transparent",
                  border: `1px solid ${active ? "rgba(255,255,255,0.1)" : "transparent"}`,
                }}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}

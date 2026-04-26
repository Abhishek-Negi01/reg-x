/* Displays FIRST or FOLLOW sets as a clean table */
export default function FirstFollowTable({ data, title, color = "#818CF8" }) {
  if (!data) return null;
  const entries = Object.entries(data);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{
        padding: "10px 16px",
        background: "#1F2937",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: "#F9FAFB" }}>{title}</span>
        <span style={{ fontSize: 11, color: "#6B7280", marginLeft: "auto" }}>
          {entries.length} symbol{entries.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ background: "#111827" }}>
        {entries.map(([sym, set], i) => (
          <div key={sym} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "10px 16px",
            borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Symbol */}
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700, fontSize: 14,
              color, minWidth: 32, flexShrink: 0,
            }}>{sym}</span>

            <span style={{ color: "#374151", fontSize: 13, flexShrink: 0 }}>→</span>

            {/* Set */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {[...set].map(s => (
                <span key={s} style={{
                  padding: "2px 9px", borderRadius: 5,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, fontWeight: 600,
                  background: s === "ε" || s === "$"
                    ? "rgba(107,114,128,0.2)"
                    : "rgba(99,102,241,0.12)",
                  border: `1px solid ${s === "ε" || s === "$" ? "rgba(107,114,128,0.3)" : "rgba(99,102,241,0.25)"}`,
                  color: s === "ε" || s === "$" ? "#9CA3AF" : "#A5B4FC",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

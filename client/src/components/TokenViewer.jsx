/* Solid backgrounds — white text — no transparency mud */
const TYPES = {
  KEYWORD:    { bg: "#5B21B6", border: "#7C3AED", text: "#fff", abbr: "KW"  },
  IDENTIFIER: { bg: "#1D4ED8", border: "#3B82F6", text: "#fff", abbr: "ID"  },
  NUMBER:     { bg: "#0E7490", border: "#06B6D4", text: "#fff", abbr: "NUM" },
  PLUS:       { bg: "#065F46", border: "#10B981", text: "#fff", abbr: "+"   },
  MULTIPLY:   { bg: "#92400E", border: "#F59E0B", text: "#fff", abbr: "×"   },
  LPAREN:     { bg: "#374151", border: "#6B7280", text: "#F9FAFB", abbr: "(" },
  RPAREN:     { bg: "#374151", border: "#6B7280", text: "#F9FAFB", abbr: ")" },
  ERROR:      { bg: "#991B1B", border: "#EF4444", text: "#fff", abbr: "ERR" },
};
const DEFAULT = { bg: "#1F2937", border: "#4B5563", text: "#F9FAFB", abbr: "?" };

export default function TokenViewer({ tokens, errors }) {
  if (!tokens?.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div>
        <span className="label" style={{ marginBottom: 12 }}>Token Stream</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} className="stagger">
          {tokens.map((t, i) => {
            const c = TYPES[t.type] || DEFAULT;
            return (
              <div key={i}
                className="token-badge anim-fade-up"
                title={`${t.type}: ${t.value}`}
                style={{
                  background: c.bg,
                  borderColor: c.border,
                  animationDelay: `${Math.min(i * 0.045, 0.45)}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${c.border}50`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
              >
                <span className="token-type-label" style={{ color: c.text }}>{c.abbr}</span>
                <span className="token-value"       style={{ color: c.text }}>{t.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {errors?.length > 0 && (
        <div className="banner banner-error anim-fade-in">
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {errors.length} lexical error{errors.length > 1 ? "s" : ""}
            </div>
            {errors.map((e, i) => (
              <div key={i} className="mono" style={{ fontSize: 12, marginTop: 2, opacity: 0.85 }}>
                Position {e.position}: unexpected '{e.value}'
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

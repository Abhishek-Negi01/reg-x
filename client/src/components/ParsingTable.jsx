/* LL(1) Parsing Table — rows = non-terminals, cols = terminals */
export default function ParsingTable({ table, isLL1, conflict }) {
  if (!table) return null;

  const nonTerminals = Object.keys(table);
  if (!nonTerminals.length) return null;

  // collect all terminals (columns)
  const termSet = new Set();
  nonTerminals.forEach(nt => Object.keys(table[nt] || {}).forEach(t => termSet.add(t)));
  // put $ last
  const terminals = [...termSet].filter(t => t !== "$").sort();
  if (termSet.has("$")) terminals.push("$");

  const cellStyle = (val) => ({
    padding: "8px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, fontWeight: val ? 600 : 400,
    color: val ? "#E5E7EB" : "#2D3748",
    background: val ? "rgba(99,102,241,0.08)" : "transparent",
    border: "1px solid rgba(255,255,255,0.05)",
    textAlign: "center",
    whiteSpace: "nowrap",
    minWidth: 90,
  });

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header */}
      <div style={{
        padding: "10px 16px", background: "#1F2937",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#F9FAFB" }}>Parsing Table</span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
          background: isLL1 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${isLL1 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: isLL1 ? "#6EE7B7" : "#FCA5A5",
        }}>
          {isLL1 ? "✓ LL(1)" : "✗ Not LL(1)"}
        </span>
        {conflict && (
          <span style={{ fontSize: 11, color: "#FCA5A5", marginLeft: 4 }}>
            Conflict: {conflict}
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", background: "#111827" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{
                ...cellStyle(true),
                background: "#1F2937", color: "#9CA3AF",
                fontWeight: 700, position: "sticky", left: 0, zIndex: 1,
              }}>NT \ T</th>
              {terminals.map(t => (
                <th key={t} style={{
                  ...cellStyle(true),
                  background: "#1F2937", color: "#FBBF24",
                }}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map(nt => (
              <tr key={nt}>
                <td style={{
                  ...cellStyle(true),
                  background: "#161B22", color: "#818CF8",
                  fontWeight: 700, position: "sticky", left: 0,
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                }}>{nt}</td>
                {terminals.map(t => {
                  const val = table[nt]?.[t];
                  return (
                    <td key={t} style={cellStyle(!!val)}>
                      {val ? `${nt} → ${val.join ? val.join(" ") : val}` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

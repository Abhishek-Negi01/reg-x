import { Handle, Position } from "reactflow";

const NON_TERMINALS = new Set(["E", "E'", "T", "T'", "F"]);

function getScheme(value) {
  if (value === "ε") {
    // Gray — clearly distinct, readable
    return { bg: "#374151", border: "#9ca3af", text: "#f9fafb" };
  }
  if (NON_TERMINALS.has(value)) {
    // Indigo — non-terminals
    return { bg: "#3730a3", border: "#a5b4fc", text: "#ffffff" };
  }
  // Terminal — teal/emerald
  return { bg: "#065f46", border: "#34d399", text: "#ffffff" };
}

export default function TreeNode({ data }) {
  const { label } = data;
  const { bg, border, text } = getScheme(label);

  return (
    <>
      <Handle type="target" position={Position.Top}
        style={{ background: border, width: 8, height: 8, border: `2px solid ${bg}` }} />

      <div style={{
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 8,
        padding: "8px 14px",
        color: text,
        fontSize: 13,
        fontWeight: 700,
        minWidth: 44,
        width: "auto",
        textAlign: "center",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        whiteSpace: "nowrap",
        boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
      }}>
        {label}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: border, width: 8, height: 8, border: `2px solid ${bg}` }} />
    </>
  );
}

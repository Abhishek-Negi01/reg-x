import { Handle, Position } from "reactflow";

/*
  Color system — each scheme has a solid background with HIGH contrast text.
  We use saturated mid-tone backgrounds so nodes pop against both dark and
  light canvas backgrounds.
*/
const SCHEME = {
  start:  { bg: "#3730a3", border: "#818cf8", text: "#ffffff", glow: "rgba(99,102,241,0.5)"  },
  accept: { bg: "#065f46", border: "#34d399", text: "#ffffff", glow: "rgba(52,211,153,0.45)" },
  both:   { bg: "#92400e", border: "#fbbf24", text: "#ffffff", glow: "rgba(251,191,36,0.5)"  },
  normal: { bg: "#1e293b", border: "#64748b", text: "#f1f5f9", glow: "rgba(100,116,139,0.3)" },
};

export default function StateNode({ data }) {
  const { isStart, isAccept, label } = data;
  const s =
    isStart && isAccept ? SCHEME.both
    : isStart            ? SCHEME.start
    : isAccept           ? SCHEME.accept
    : SCHEME.normal;

  return (
    <>
      <Handle type="target" position={Position.Left}
        style={{ background: s.border, width: 10, height: 10, border: `2px solid ${s.bg}` }} />

      <div style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        borderRadius: 10,
        padding: "10px 20px",
        color: s.text,
        fontSize: 14,
        fontWeight: 700,
        minWidth: 56,
        textAlign: "center",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        boxShadow: isAccept
          ? `0 0 0 3px ${s.bg}, 0 0 0 5px ${s.border}, 0 4px 16px ${s.glow}`
          : `0 2px 8px ${s.glow}`,
        outline: isStart ? `2px dashed ${s.border}` : "none",
        outlineOffset: 5,
      }}>
        {label}
      </div>

      <Handle type="source" position={Position.Right}
        style={{ background: s.border, width: 10, height: 10, border: `2px solid ${s.bg}` }} />
    </>
  );
}

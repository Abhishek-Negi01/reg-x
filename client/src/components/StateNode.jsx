import { Handle, Position } from "reactflow";

const COLORS = {
  start: "#6366f1",
  accept: "#10b981",
  both: "#f59e0b",
  normal: "#4b5563",
};

export default function StateNode({ data }) {
  const { isStart, isAccept, label } = data;
  const color =
    isStart && isAccept ? COLORS.both
    : isStart ? COLORS.start
    : isAccept ? COLORS.accept
    : COLORS.normal;

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div
        style={{
          border: `2px solid ${color}`,
          borderRadius: isAccept ? "50%" : "8px",
          padding: "8px 14px",
          background: "#1f2937",
          color: "#f9fafb",
          fontSize: 13,
          fontWeight: 600,
          minWidth: 44,
          textAlign: "center",
          outline: isStart ? `3px solid ${color}` : "none",
          outlineOffset: 3,
        }}
      >
        {label}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </>
  );
}

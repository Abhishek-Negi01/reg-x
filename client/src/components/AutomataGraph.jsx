import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";
import StateNode from "./StateNode";

const nodeTypes = { state: StateNode };

const NODE_W = 100;
const NODE_H  = 44;
const H_GAP   = 90;
const V_GAP   = 90;

function layoutNodes(rawNodes, rawEdges) {
  if (!rawNodes.length) return [];

  const adj = {};
  rawNodes.forEach((n) => { adj[n.id] = []; });
  rawEdges.forEach((e) => { if (adj[e.source]) adj[e.source].push(e.target); });

  const startNode = rawNodes.find((n) => n.data?.isStart) || rawNodes[0];
  const layer = {};
  const queue = [startNode.id];
  layer[startNode.id] = 0;

  while (queue.length) {
    const cur = queue.shift();
    for (const next of (adj[cur] || [])) {
      if (layer[next] === undefined && next !== cur) {
        layer[next] = layer[cur] + 1;
        queue.push(next);
      }
    }
  }
  rawNodes.forEach((n) => { if (layer[n.id] === undefined) layer[n.id] = 0; });

  const byLayer = {};
  rawNodes.forEach((n) => {
    const l = layer[n.id];
    if (!byLayer[l]) byLayer[l] = [];
    byLayer[l].push(n.id);
  });

  const pos = {};
  Object.entries(byLayer).forEach(([l, ids]) => {
    const x = Number(l) * (NODE_W + H_GAP);
    const totalH = ids.length * NODE_H + (ids.length - 1) * V_GAP;
    const startY = -totalH / 2;
    ids.forEach((id, i) => {
      pos[id] = { x, y: startY + i * (NODE_H + V_GAP) };
    });
  });

  return rawNodes.map((n) => ({
    id: n.id, type: "state", data: n.data,
    position: pos[n.id] || { x: 0, y: 0 },
  }));
}

function buildEdges(rawEdges) {
  const map = {};
  rawEdges.forEach((e) => {
    const key = `${e.source}__${e.target}`;
    if (!map[key]) map[key] = { source: e.source, target: e.target, label: e.label };
    else map[key].label += `, ${e.label}`;
  });

  return Object.values(map).map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: e.source === e.target ? "selfConnecting" : "default",
    labelStyle: {
      fill: "#f1f5f9",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
    },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 1, rx: 4 },
    labelBgPadding: [5, 8],
    style: { stroke: "#94a3b8", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 18, height: 18 },
  }));
}

export default function AutomataGraph({ nodes: rawNodes, edges: rawEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(() => layoutNodes(rawNodes, rawEdges));
  const [edges, setEdges, onEdgesChange] = useEdgesState(() => buildEdges(rawEdges));

  useEffect(() => {
    setNodes(layoutNodes(rawNodes, rawEdges));
    setEdges(buildEdges(rawEdges));
  }, [rawNodes, rawEdges]);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b" }}>
      {/* Canvas — use #111827 (not pure black) so nodes are visible */}
      <div style={{ height: 480, background: "#111827" }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.35 }}
          minZoom={0.25} maxZoom={2.5}
        >
          <Background color="#1e293b" gap={28} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(n) =>
              n.data?.isStart && n.data?.isAccept ? "#fbbf24"
              : n.data?.isStart  ? "#818cf8"
              : n.data?.isAccept ? "#34d399"
              : "#64748b"
            }
            maskColor="rgba(0,0,0,0.6)"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 16,
        padding: "10px 16px",
        background: "#0f172a",
        borderTop: "1px solid #1e293b",
        fontSize: 12, color: "#94a3b8",
      }}>
        {[
          { bg: "#3730a3", border: "#818cf8", label: "Start state",       dashed: true  },
          { bg: "#065f46", border: "#34d399", label: "Accept state",      dashed: false },
          { bg: "#92400e", border: "#fbbf24", label: "Start + Accept",    dashed: true  },
          { bg: "#1e293b", border: "#64748b", label: "Normal state",      dashed: false },
        ].map(({ bg, border, label, dashed }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: 4,
              background: bg,
              border: `2px ${dashed ? "dashed" : "solid"} ${border}`,
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: "#475569" }}>
          Drag · scroll to zoom
        </span>
      </div>
    </div>
  );
}

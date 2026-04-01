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

// Stable reference — defined at module scope in a file with no other state
const nodeTypes = { state: StateNode };

function layoutNodes(nodes) {
  const cols = Math.ceil(Math.sqrt(nodes.length)) || 1;
  return nodes.map((n, i) => ({
    id: n.id,
    type: "state",
    data: n.data,
    position: { x: (i % cols) * 200, y: Math.floor(i / cols) * 140 },
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
    labelStyle: { fill: "#d1d5db", fontSize: 12 },
    labelBgStyle: { fill: "#111827", fillOpacity: 0.85 },
    style: { stroke: "#6b7280" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
  }));
}

export default function AutomataGraph({ nodes: rawNodes, edges: rawEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(() => layoutNodes(rawNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(() => buildEdges(rawEdges));

  useEffect(() => {
    setNodes(layoutNodes(rawNodes));
    setEdges(buildEdges(rawEdges));
  }, [rawNodes, rawEdges]);

  return (
    <div style={{ height: 420, background: "#111827", borderRadius: 12 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#374151" gap={20} />
        <Controls />
        <MiniMap nodeColor={() => "#6366f1"} style={{ background: "#1f2937" }} />
      </ReactFlow>
      <div className="flex gap-4 px-3 py-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#6366f1" }} /> Start
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: "#10b981" }} /> Accept
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f59e0b" }} /> Start+Accept
        </span>
      </div>
    </div>
  );
}

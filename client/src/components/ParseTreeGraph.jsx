import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";
import TreeNode from "./TreeNode";

const nodeTypes = { tree: TreeNode };

const NODE_W = 60;
const NODE_H = 38;
const H_GAP  = 32;
const V_GAP  = 72;

function measureWidth(node) {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, c) => sum + measureWidth(c), 0);
}

function assignX(node, offset) {
  const w = measureWidth(node);
  node._x = offset + w / 2;
  if (node.children?.length) {
    let cursor = offset;
    for (const child of node.children) {
      assignX(child, cursor);
      cursor += measureWidth(child);
    }
  }
}

function flatten(node, parentId, depth, nodes, edges, counter) {
  const id = `n${counter.v++}`;
  nodes.push({
    id, type: "tree",
    data: { label: node.value },
    position: {
      x: node._x * (NODE_W + H_GAP),
      y: depth  * (NODE_H + V_GAP),
    },
  });
  if (parentId) {
    edges.push({
      id: `${parentId}-${id}`,
      source: parentId, target: id,
      type: "smoothstep",
      style: { stroke: "#475569", strokeWidth: 2 },
    });
  }
  for (const child of (node.children || [])) {
    flatten(child, id, depth + 1, nodes, edges, counter);
  }
}

function treeToGraph(tree) {
  const clone = JSON.parse(JSON.stringify(tree));
  assignX(clone, 0);
  const nodes = [], edges = [], counter = { v: 0 };
  flatten(clone, null, 0, nodes, edges, counter);
  return { nodes, edges };
}

export default function ParseTreeGraph({ tree }) {
  const init = treeToGraph(tree);
  const [nodes, setNodes, onNodesChange] = useNodesState(init.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(init.edges);

  useEffect(() => {
    const { nodes: n, edges: e } = treeToGraph(tree);
    setNodes(n); setEdges(e);
  }, [tree]);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ height: 520, background: "#111827" }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2} maxZoom={2.5}
        >
          <Background color="#1e293b" gap={28} size={1} />
          <Controls />
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
          { bg: "#3730a3", border: "#a5b4fc", label: "Non-terminal (E, T, F, E′, T′)" },
          { bg: "#065f46", border: "#34d399", label: "Terminal (id, +, *, (, ))" },
          { bg: "#374151", border: "#9ca3af", label: "ε (empty production)" },
        ].map(({ bg, border, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: 4,
              background: bg, border: `2px solid ${border}`,
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: "#475569" }}>
          Scroll to zoom · drag to pan
        </span>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import * as d3 from "d3";

/* Dynamically detect non-terminals: nodes that have children */
function collectNonTerminals(node, set = new Set()) {
  if (node.children?.length) {
    set.add(node.value);
    node.children.forEach(c => collectNonTerminals(c, set));
  }
  return set;
}

function nodeScheme(value, nonTerminals) {
  if (value === "ε") return { fill: "#1F2937", stroke: "#6B7280", text: "#9CA3AF" };
  if (nonTerminals.has(value)) return { fill: "#3730A3", stroke: "#818CF8", text: "#fff" };
  return { fill: "#065F46", stroke: "#34D399", text: "#fff" };
}

function toHierarchy(node) {
  return {
    name: node.value,
    children: node.children?.length ? node.children.map(toHierarchy) : undefined,
  };
}

export default function ParseTreeGraph({ tree }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!tree) return;

    const nonTerminals = collectNonTerminals(tree);
    const root = d3.hierarchy(toHierarchy(tree));
    const depth     = root.height;
    const leafCount = root.leaves().length;

    /* dynamic canvas */
    const nodeW  = 68;
    const nodeH  = 34;
    const levelH = 88;
    const minSep = nodeW + 20;

    const W = Math.max(leafCount * minSep + 80, 600);
    const H = (depth + 1) * levelH + 80;

    const treeLayout = d3.tree()
      .size([W - 80, H - 60])
      .separation((a, b) => a.parent === b.parent ? 1.3 : 2.0);

    treeLayout(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`)
       .attr("width", "100%")
       .attr("height", H);

    const g = svg.append("g").attr("transform", "translate(40, 30)");

    /* zoom + pan */
    svg.call(d3.zoom().scaleExtent([0.25, 3])
      .on("zoom", ev => g.attr("transform", ev.transform)));

    /* ── links — use curved path ── */
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#374151")
      .attr("stroke-width", 1.8)
      .attr("d", d => {
        const sx = d.source.x, sy = d.source.y;
        const tx = d.target.x, ty = d.target.y;
        const my = (sy + ty) / 2;
        return `M${sx},${sy + nodeH/2} C${sx},${my} ${tx},${my} ${tx},${ty - nodeH/2}`;
      });

    /* ── nodes ── */
    root.descendants().forEach(d => {
      const sc = nodeScheme(d.data.name, nonTerminals);
      const label = d.data.name;
      const tw = Math.max(label.length * 9 + 24, 44);
      const ng = g.append("g").attr("transform", `translate(${d.x},${d.y})`);

      ng.append("rect")
        .attr("x", -tw / 2).attr("y", -nodeH / 2)
        .attr("width", tw).attr("height", nodeH)
        .attr("rx", 7)
        .attr("fill", sc.fill)
        .attr("stroke", sc.stroke)
        .attr("stroke-width", 2);

      ng.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 13)
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("font-weight", 700)
        .attr("fill", sc.text)
        .text(label);
    });

  }, [tree]);

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ background: "#111827", overflowX: "auto" }}>
        <svg ref={svgRef} style={{ display: "block" }} />
      </div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 16,
        padding: "10px 16px", background: "#1F2937",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        fontSize: 12, color: "#9CA3AF",
      }}>
        {[
          { fill: "#3730A3", stroke: "#818CF8", label: "Non-terminal (E, T, F, E′, T′)" },
          { fill: "#065F46", stroke: "#34D399", label: "Terminal (id, +, *, (, ))"       },
          { fill: "#1F2937", stroke: "#6B7280", label: "ε (empty production)"            },
        ].map(({ fill, stroke, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: 3,
              background: fill, border: `2px solid ${stroke}`, flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: "#4B5563" }}>
          Scroll to zoom · drag to pan
        </span>
      </div>
    </div>
  );
}

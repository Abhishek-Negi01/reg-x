import { useEffect, useRef } from "react";
import * as d3 from "d3";

/* ── constants ── */
const R        = 28;   // node radius
const H_SPACE  = 160;  // horizontal space per layer
const V_SPACE  = 110;  // vertical space between nodes in same layer
const PAD      = 70;   // canvas padding

const SCHEME = {
  start:  { fill: "#3730A3", stroke: "#818CF8", text: "#fff" },
  accept: { fill: "#065F46", stroke: "#34D399", text: "#fff" },
  both:   { fill: "#78350F", stroke: "#FBBF24", text: "#fff" },
  normal: { fill: "#1E293B", stroke: "#64748B", text: "#E2E8F0" },
};
function scheme(n) {
  if (n.isStart && n.isAccept) return SCHEME.both;
  if (n.isStart)  return SCHEME.start;
  if (n.isAccept) return SCHEME.accept;
  return SCHEME.normal;
}

/* ── BFS layered layout ──────────────────────────────────────────────
   Assigns each node a column (layer) based on BFS distance from start.
   Within each column nodes are spread vertically.
   Dead/sink states go to their own column at the end.
──────────────────────────────────────────────────────────────────── */
function bfsLayout(nodes, edges) {
  const startNode = nodes.find(n => n.isStart) || nodes[0];
  if (!startNode) return nodes;

  // adjacency (excluding self-loops)
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (e.source !== e.target && adj[e.source]) {
      if (!adj[e.source].includes(e.target)) adj[e.source].push(e.target);
    }
  });

  // BFS to assign layers
  const layer = {};
  const queue = [startNode.id];
  layer[startNode.id] = 0;
  while (queue.length) {
    const cur = queue.shift();
    for (const next of adj[cur] || []) {
      if (layer[next] === undefined) {
        layer[next] = layer[cur] + 1;
        queue.push(next);
      }
    }
  }

  // unreachable nodes (e.g. isolated dead state) get their own layer
  const maxLayer = Math.max(0, ...Object.values(layer));
  nodes.forEach(n => {
    if (layer[n.id] === undefined) layer[n.id] = maxLayer + 1;
  });

  // group by layer
  const byLayer = {};
  nodes.forEach(n => {
    const l = layer[n.id];
    if (!byLayer[l]) byLayer[l] = [];
    byLayer[l].push(n.id);
  });

  // assign x,y
  const pos = {};
  Object.entries(byLayer).forEach(([l, ids]) => {
    const x = PAD + Number(l) * H_SPACE;
    const totalH = (ids.length - 1) * V_SPACE;
    ids.forEach((id, i) => {
      pos[id] = { x, y: PAD + i * V_SPACE - totalH / 2 };
    });
  });

  // canvas size
  const maxX = Math.max(...Object.values(pos).map(p => p.x)) + PAD + R;
  const maxY = Math.max(...Object.values(pos).map(p => p.y)) + PAD + R;
  const minY = Math.min(...Object.values(pos).map(p => p.y)) - PAD - R;
  const W = Math.max(maxX, 600);
  const H = Math.max(maxY - minY + PAD * 2, 300);
  const yOffset = -minY + PAD;

  return { pos, W, H: H + PAD, yOffset, layer };
}

/* ── path helpers ── */
function qPath(sx, sy, tx, ty, curve) {
  const dx = tx - sx, dy = ty - sy;
  const cx = (sx + tx) / 2 - curve * dy;
  const cy = (sy + ty) / 2 + curve * dx;
  const a1 = Math.atan2(cy - sy, cx - sx);
  const a2 = Math.atan2(ty - cy, tx - cx);
  const gap = R + 4;
  return `M${sx + Math.cos(a1)*gap},${sy + Math.sin(a1)*gap}
    Q${cx},${cy}
    ${tx - Math.cos(a2)*gap},${ty - Math.sin(a2)*gap}`;
}

function qMid(sx, sy, tx, ty, curve) {
  const dx = tx - sx, dy = ty - sy;
  const cx = (sx + tx) / 2 - curve * dy;
  const cy = (sy + ty) / 2 + curve * dx;
  return { x: 0.25*sx + 0.5*cx + 0.25*tx, y: 0.25*sy + 0.5*cy + 0.25*ty };
}

function selfPath(cx, cy) {
  const r = 24;
  return `M${cx - r*0.5},${cy - R}
    C${cx - r*2.4},${cy - R - r*3.2}
      ${cx + r*2.4},${cy - R - r*3.2}
    ${cx + r*0.5},${cy - R}`;
}

/* ── component ── */
export default function AutomataGraph({ nodes: rawNodes, edges: rawEdges }) {
  const containerRef = useRef(null);
  const svgRef       = useRef(null);

  useEffect(() => {
    if (!rawNodes?.length) return;

    /* merge parallel edges */
    const edgeMap = {};
    rawEdges.forEach(e => {
      const k = `${e.source}__${e.target}`;
      edgeMap[k] = edgeMap[k]
        ? { ...edgeMap[k], label: edgeMap[k].label + ", " + e.label }
        : { source: e.source, target: e.target, label: e.label };
    });
    const edges = Object.values(edgeMap);

    /* node objects */
    const nodes = rawNodes.map(n => ({
      id:       n.id,
      isStart:  !!n.data?.isStart,
      isAccept: !!n.data?.isAccept,
    }));
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

    /* bidirectional detection */
    const edgeSet = new Set(edges.map(e => `${e.source}__${e.target}`));
    const isBidi  = (a, b) => edgeSet.has(`${a}__${b}`) && edgeSet.has(`${b}__${a}`);

    /* layout */
    const { pos, W, H, yOffset, layer } = bfsLayout(nodes, edges);

    /* mutable positions (for drag) */
    const mpos = {};
    nodes.forEach(n => {
      mpos[n.id] = { x: pos[n.id].x, y: pos[n.id].y + yOffset };
    });

    /* build SVG */
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${W} ${H}`);

    /* arrowhead */
    svg.append("defs").append("marker")
      .attr("id", "arr")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10).attr("refY", 0)
      .attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#94A3B8");

    const g = svg.append("g");

    /* zoom */
    svg.call(d3.zoom().scaleExtent([0.25, 3])
      .on("zoom", ev => g.attr("transform", ev.transform)));

    /* ── draw edges ── */
    const edgeEls = edges.map(e => {
      const s = byId[e.source], t = byId[e.target];
      if (!s || !t) return null;
      const eg = g.append("g");

      const pathEl = eg.append("path")
        .attr("fill", "none").attr("stroke", "#64748B")
        .attr("stroke-width", 2).attr("marker-end", "url(#arr)");

      const bgEl = eg.append("rect")
        .attr("rx", 4).attr("fill", "#111827").attr("opacity", 0.95);

      const textEl = eg.append("text")
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 12)
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("font-weight", 700).attr("fill", "#F1F5F9")
        .text(e.label);

      return { e, s, t, pathEl, bgEl, textEl };
    }).filter(Boolean);

    /* ── draw nodes ── */
    const nodeEls = nodes.map(n => {
      const sc = scheme(n);
      const ng = g.append("g").style("cursor", "grab");

      // accept double ring
      const outerCircle = n.isAccept
        ? ng.append("circle").attr("r", R + 6)
            .attr("fill", "none").attr("stroke", sc.stroke)
            .attr("stroke-width", 1.8).attr("opacity", 0.65)
        : null;

      const circle = ng.append("circle").attr("r", R)
        .attr("fill", sc.fill).attr("stroke", sc.stroke).attr("stroke-width", 2.5);

      // start arrow
      const startLine = n.isStart
        ? ng.append("line")
            .attr("stroke", sc.stroke).attr("stroke-width", 2.5)
            .attr("marker-end", "url(#arr)")
        : null;

      ng.append("text")
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("font-size", 13)
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("font-weight", 700).attr("fill", sc.text)
        .text(n.id);

      // drag
      ng.call(d3.drag()
        .on("start", function () { d3.select(this).style("cursor", "grabbing"); })
        .on("drag", function (ev) {
          mpos[n.id].x = ev.x;
          mpos[n.id].y = ev.y;
          redraw();
        })
        .on("end", function () { d3.select(this).style("cursor", "grab"); })
      );

      return { n, ng, outerCircle, startLine };
    });

    /* ── redraw positions ── */
    function redraw() {
      // nodes
      nodeEls.forEach(({ n, ng, outerCircle, startLine }) => {
        const { x, y } = mpos[n.id];
        ng.attr("transform", `translate(${x},${y})`);
        if (startLine) {
          startLine.attr("x1", -R - 32).attr("y1", 0)
                   .attr("x2", -R - 5).attr("y2", 0);
        }
      });

      // edges
      edgeEls.forEach(({ e, s, t, pathEl, bgEl, textEl }) => {
        const sp = mpos[s.id], tp = mpos[t.id];

        if (s.id === t.id) {
          pathEl.attr("d", selfPath(sp.x, sp.y));
          textEl.attr("x", sp.x).attr("y", sp.y - R - 52);
        } else {
          // back-edges (target layer <= source layer) get more curve
          const sl = layer[s.id] ?? 0, tl = layer[t.id] ?? 0;
          const isBack = tl <= sl;
          const curve = isBidi(e.source, e.target) ? 0.35
                      : isBack                     ? -0.4
                      : 0.1;
          pathEl.attr("d", qPath(sp.x, sp.y, tp.x, tp.y, curve));
          const mid = qMid(sp.x, sp.y, tp.x, tp.y, curve);
          textEl.attr("x", mid.x).attr("y", mid.y);
        }

        // label background
        try {
          const bb = textEl.node().getBBox();
          bgEl.attr("x", bb.x - 5).attr("y", bb.y - 3)
              .attr("width", bb.width + 10).attr("height", bb.height + 6);
        } catch (_) {}
      });
    }

    redraw();

  }, [rawNodes, rawEdges]);

  return (
    <div ref={containerRef}
      style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ background: "#111827", overflowX: "auto" }}>
        <svg ref={svgRef} width="100%"
          style={{ display: "block", minHeight: 320 }} />
      </div>
      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 16,
        padding: "10px 16px", background: "#1F2937",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        fontSize: 12, color: "#9CA3AF",
      }}>
        {[
          { fill: "#3730A3", stroke: "#818CF8", label: "Start",         dashed: true  },
          { fill: "#065F46", stroke: "#34D399", label: "Accept",        dashed: false },
          { fill: "#78350F", stroke: "#FBBF24", label: "Start+Accept",  dashed: true  },
          { fill: "#1E293B", stroke: "#64748B", label: "Normal",        dashed: false },
        ].map(({ fill, stroke, label, dashed }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              background: fill,
              border: `2px ${dashed ? "dashed" : "solid"} ${stroke}`,
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: "#4B5563" }}>
          Drag nodes · scroll to zoom
        </span>
      </div>
    </div>
  );
}

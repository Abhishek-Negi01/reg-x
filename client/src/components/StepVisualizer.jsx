import { useState, useEffect, useRef } from "react";

const SPEEDS = { Slow: 900, Normal: 500, Fast: 180 };

export default function StepVisualizer({ steps }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState("Normal");
  const timer = useRef(null);

  useEffect(() => { setCurrent(0); setPlaying(false); }, [steps]);

  useEffect(() => {
    clearInterval(timer.current);
    if (playing) {
      timer.current = setInterval(() => {
        setCurrent(c => {
          if (c >= steps.length - 1) { setPlaying(false); return c; }
          return c + 1;
        });
      }, SPEEDS[speed]);
    }
    return () => clearInterval(timer.current);
  }, [playing, speed, steps.length]);

  const step  = steps[current];
  const pct   = ((current + 1) / steps.length) * 100;
  const atEnd = current >= steps.length - 1;

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid rgba(99,102,241,0.2)",
      background: "rgba(17,24,39,0.8)",
      backdropFilter: "blur(8px)",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "12px 18px",
        background: "rgba(30,41,59,0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#e6edf3" }}>
            DFA Simulation
          </span>
          <span style={{ marginLeft: 10, fontSize: 12, color: "#6b7a8d" }}>
            {current + 1} / {steps.length} transitions
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Speed selector */}
          <div style={{
            display: "flex", borderRadius: 6, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {Object.keys(SPEEDS).map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{
                padding: "4px 11px", fontSize: 11, fontWeight: 600,
                cursor: "pointer", border: "none", transition: "all 0.15s",
                background: speed === s ? "rgba(99,102,241,0.8)" : "rgba(30,41,59,0.8)",
                color: speed === s ? "#fff" : "#6b7a8d",
              }}>{s}</button>
            ))}
          </div>

          {/* ↺ */}
          <CtrlBtn onClick={() => { setCurrent(0); setPlaying(false); }} title="Reset">↺</CtrlBtn>
          {/* ◀ */}
          <CtrlBtn onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>◀</CtrlBtn>
          {/* Play/Pause */}
          <button
            onClick={() => { if (atEnd) { setCurrent(0); setPlaying(true); } else setPlaying(p => !p); }}
            style={{
              padding: "5px 18px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", color: "#fff", cursor: "pointer",
              minWidth: 84, transition: "all 0.18s",
              boxShadow: "0 2px 10px rgba(99,102,241,0.3)",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(99,102,241,0.3)"}
          >
            {atEnd ? "↺ Replay" : playing ? "⏸ Pause" : "▶ Play"}
          </button>
          {/* ▶ */}
          <CtrlBtn onClick={() => setCurrent(c => Math.min(steps.length - 1, c + 1))} disabled={atEnd}>▶</CtrlBtn>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          width: `${pct}%`,
          transition: "width 0.25s ease",
          boxShadow: "0 0 8px rgba(99,102,241,0.6)",
        }} />
      </div>

      {/* ── Transition display ── */}
      {step && (
        <div style={{
          padding: "32px 24px",
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 28, flexWrap: "wrap",
        }}>
          <StateBox label="Current State" value={step.from}
            bg="rgba(55,48,163,0.4)" border="#818cf8" glow="rgba(99,102,241,0.4)" />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span className="label">Read</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 800, fontSize: 32,
              color: "#fbbf24",
              background: "rgba(120,53,15,0.4)",
              border: "2px solid rgba(245,158,11,0.6)",
              borderRadius: 10, padding: "8px 22px",
              minWidth: 60, textAlign: "center",
              boxShadow: "0 0 20px rgba(245,158,11,0.25)",
            }}>
              {step.char}
            </span>
          </div>

          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.15)", fontWeight: 300 }}>→</span>

          <StateBox label="Next State" value={step.to ?? "—"}
            bg="rgba(6,95,70,0.4)" border="#34d399" glow="rgba(16,185,129,0.4)" />
        </div>
      )}

      {/* ── Character scrubber ── */}
      <div style={{
        padding: "0 18px 18px",
        display: "flex", flexWrap: "wrap", gap: 5,
      }}>
        {steps.map((s, i) => (
          <button key={i}
            onClick={() => { setCurrent(i); setPlaying(false); }}
            title={`${s.from} → '${s.char}' → ${s.to}`}
            style={{
              width: 32, height: 32, borderRadius: 6,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", border: "none",
              transition: "all 0.15s",
              background:
                i === current ? "rgba(99,102,241,0.8)"
                : i < current ? "rgba(29,78,216,0.2)"
                : "rgba(30,41,59,0.6)",
              color:
                i === current ? "#fff"
                : i < current ? "#93c5fd"
                : "#4d5f73",
              outline: i === current ? "2px solid rgba(129,140,248,0.6)" : "none",
              outlineOffset: 2,
              boxShadow: i === current ? "0 0 10px rgba(99,102,241,0.4)" : "none",
            }}>
            {s.char}
          </button>
        ))}
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, disabled, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      padding: "5px 11px", borderRadius: 6, fontSize: 13, fontWeight: 700,
      background: "rgba(30,41,59,0.8)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: disabled ? "#2d3f55" : "#8b98a9",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = "#e6edf3"; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = "#8b98a9"; }}
    >{children}</button>
  );
}

function StateBox({ label, value, bg, border, glow }) {
  return (
    <div className="state-box">
      <span className="state-box-label">{label}</span>
      <span className="state-box-value" style={{
        background: bg, borderColor: border,
        boxShadow: `0 0 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}>
        {value}
      </span>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPEED_MIN = 300;
const SPEED_MAX = 1200;

function actionScheme(action = "") {
  if (action.startsWith("Match"))  return { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  text: "#34D399" };
  if (action.startsWith("Expand")) return { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.3)",  text: "#A5B4FC" };
  if (action.startsWith("Accept")) return { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#FBBF24" };
  if (action.startsWith("Error"))  return { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#FCA5A5" };
  return                                  { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)",  text: "#A5B4FC" };
}

function TokenChip({ value, highlight, dim }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 36, height: 34, padding: "0 10px", borderRadius: 7,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13, fontWeight: 700,
      background: highlight ? "rgba(99,102,241,0.25)" : dim ? "rgba(255,255,255,0.02)" : "#1F2937",
      border: `1.5px solid ${highlight ? "#818CF8" : dim ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)"}`,
      color: highlight ? "#A5B4FC" : dim ? "#374151" : "#E5E7EB",
      boxShadow: highlight ? "0 0 14px rgba(99,102,241,0.45)" : "none",
      transition: "all 0.25s",
      flexShrink: 0,
    }}>
      {value}
    </span>
  );
}

export default function LL1StepVisualizer({ steps }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed,   setSpeed]   = useState(700);
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
      }, speed);
    }
    return () => clearInterval(timer.current);
  }, [playing, speed, steps.length]);

  if (!steps?.length) return null;

  const step  = steps[current];
  const atEnd = current >= steps.length - 1;
  const pct   = ((current + 1) / steps.length) * 100;
  const ac    = actionScheme(step?.action);

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "#111827",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        background: "#1F2937",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#F9FAFB" }}>LL(1) Parse Steps</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            color: "#A5B4FC",
          }}>
            {current + 1} / {steps.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Speed slider */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" }}>Speed</span>
            <input
              type="range" min={SPEED_MIN} max={SPEED_MAX} step={50}
              value={SPEED_MAX - speed + SPEED_MIN}
              onChange={e => setSpeed(SPEED_MAX - Number(e.target.value) + SPEED_MIN)}
              style={{ width: 72, accentColor: "#6366F1", cursor: "pointer" }}
            />
          </div>

          <Ctrl onClick={() => { setCurrent(0); setPlaying(false); }} title="Reset">↺</Ctrl>
          <Ctrl onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>◀</Ctrl>
          <button
            onClick={() => { if (atEnd) { setCurrent(0); setPlaying(true); } else setPlaying(p => !p); }}
            style={{
              padding: "5px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              border: "none", color: "#fff", cursor: "pointer", minWidth: 80,
              boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.35)"; }}
          >
            {atEnd ? "↺ Replay" : playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <Ctrl onClick={() => setCurrent(c => Math.min(steps.length - 1, c + 1))} disabled={atEnd}>▶</Ctrl>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ height: 3, background: "linear-gradient(90deg,#6366F1,#8B5CF6)" }}
        />
      </div>

      {/* Step display */}
      <AnimatePresence mode="wait">
        {step && (
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ padding: "20px 20px 16px" }}
          >
            {/* Stack */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: 8 }}>
                Stack <span style={{ color: "#4B5563" }}>(top →)</span>
              </span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                {[...step.stack].reverse().map((s, i) => (
                  <TokenChip key={`s-${i}-${s}`} value={s} highlight={i === 0} />
                ))}
                {step.stack.length === 0 && <span style={{ color: "#374151", fontSize: 12, fontStyle: "italic" }}>empty</span>}
              </div>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", display: "block", marginBottom: 8 }}>
                Input <span style={{ color: "#4B5563" }}>(current →)</span>
              </span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                {step.input.map((s, i) => (
                  <TokenChip key={`i-${i}-${s}`} value={s} highlight={i === 0} dim={i > 0} />
                ))}
                {step.input.length === 0 && <span style={{ color: "#374151", fontSize: 12, fontStyle: "italic" }}>empty</span>}
              </div>
            </div>

            {/* Action */}
            <motion.div
              key={step.action}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: "10px 14px", borderRadius: 8,
                background: ac.bg, border: `1px solid ${ac.border}`,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280" }}>
                Action
              </span>
              <p style={{
                margin: "4px 0 0",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, fontWeight: 600, color: ac.text,
              }}>
                {step.action}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dot scrubber */}
      <div style={{ padding: "0 18px 14px", display: "flex", flexWrap: "wrap", gap: 4 }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); setPlaying(false); }} style={{
            width: 8, height: 8, borderRadius: "50%", border: "none",
            cursor: "pointer", padding: 0, transition: "all 0.15s",
            background: i === current ? "#6366F1" : i < current ? "#3730A3" : "#1F2937",
            transform: i === current ? "scale(1.5)" : "scale(1)",
          }} />
        ))}
      </div>
    </div>
  );
}

function Ctrl({ children, onClick, disabled, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      padding: "5px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700,
      background: "#1F2937", border: "1px solid rgba(255,255,255,0.08)",
      color: disabled ? "#2D3748" : "#9CA3AF",
      cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = "#E5E7EB"; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.color = "#9CA3AF"; }}
    >{children}</button>
  );
}

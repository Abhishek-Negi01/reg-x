import { useState } from "react";

/* Very lightweight JS syntax highlighter — no external deps */
function highlight(code) {
  const keywords = /\b(function|return|if|else|for|while|const|let|var|switch|case|break|default|true|false|null|undefined|new|this)\b/g;
  const strings  = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const numbers  = /\b(\d+)\b/g;

  // escape HTML first
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // apply highlights (order matters)
  escaped = escaped
    .replace(comments, '<span style="color:#6B7280;font-style:italic">$1</span>')
    .replace(strings,  '<span style="color:#34D399">$1</span>')
    .replace(keywords, '<span style="color:#818CF8;font-weight:700">$1</span>')
    .replace(numbers,  '<span style="color:#FBBF24">$1</span>');

  return escaped;
}

export default function CodeBlock({ code, filename = "recognizer.js" }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([code], { type: "text/javascript" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  if (!code) return null;

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "#0D1117",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "#161B22",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Traffic lights */}
          {["#FF5F57","#FFBD2E","#28C840"].map(c => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" }} />
          ))}
          <span style={{
            marginLeft: 8, fontSize: 12, fontWeight: 600,
            color: "#6B7280", fontFamily: "'JetBrains Mono', monospace",
          }}>{filename}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopy} style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: copied ? "#065F46" : "#1F2937",
            border: `1px solid ${copied ? "#10B981" : "rgba(255,255,255,0.1)"}`,
            color: copied ? "#6EE7B7" : "#9CA3AF",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button onClick={handleDownload} style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: "#1F2937", border: "1px solid rgba(255,255,255,0.1)",
            color: "#9CA3AF", cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#E5E7EB"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            ↓ Download
          </button>
        </div>
      </div>

      {/* Code area */}
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 480 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
          <tbody>
            {code.split("\n").map((line, i) => (
              <tr key={i} style={{ lineHeight: "1.6" }}>
                <td style={{
                  width: 48, minWidth: 48,
                  padding: "0 12px",
                  textAlign: "right",
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#3D4451",
                  userSelect: "none",
                  borderRight: "1px solid #21262D",
                  verticalAlign: "top",
                }}>
                  {i + 1}
                </td>
                <td style={{
                  padding: "0 16px",
                  fontSize: 13.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#E6EDF3",
                  whiteSpace: "pre",
                }}
                dangerouslySetInnerHTML={{ __html: highlight(line) || "&nbsp;" }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

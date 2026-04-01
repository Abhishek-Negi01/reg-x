const TYPE_STYLES = {
  KEYWORD:    "bg-purple-900 text-purple-200 border-purple-700",
  IDENTIFIER: "bg-blue-900 text-blue-200 border-blue-700",
  PLUS:       "bg-green-900 text-green-200 border-green-700",
  MULTIPLY:   "bg-yellow-900 text-yellow-200 border-yellow-700",
  LPAREN:     "bg-gray-700 text-gray-200 border-gray-500",
  RPAREN:     "bg-gray-700 text-gray-200 border-gray-500",
  ERROR:      "bg-red-900 text-red-200 border-red-700",
};

export default function TokenViewer({ tokens, errors }) {
  if (!tokens?.length) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Token Stream</p>
        <div className="flex flex-wrap gap-2">
          {tokens.map((t, i) => (
            <span
              key={i}
              className={`inline-flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                TYPE_STYLES[t.type] || "bg-gray-700 text-gray-200 border-gray-500"
              }`}
            >
              <span className="text-[10px] opacity-60 mb-0.5">{t.type}</span>
              <span>{t.value}</span>
            </span>
          ))}
        </div>
      </div>

      {errors?.length > 0 && (
        <div className="rounded-lg border border-red-800 bg-red-950 p-3">
          <p className="text-xs text-red-400 font-semibold mb-1">Errors</p>
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-300 font-mono">
              Position {e.position}: invalid character &apos;{e.value}&apos;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

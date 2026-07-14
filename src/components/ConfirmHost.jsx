// ConfirmHost — a single styled confirm dialog for the whole app.
// Mount once near the app root. Trigger it from anywhere with confirmDialog().
import React, { useEffect, useState } from "react";
import { registerConfirmHandler } from "../utils/confirm";

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const TONES = {
  default: { accent: "#e50914", glow: "rgba(229,9,20,0.35)", icon: "❓" },
  danger:  { accent: "#ef4444", glow: "rgba(239,68,68,0.35)", icon: "⚠️" },
  success: { accent: "#22c55e", glow: "rgba(34,197,94,0.30)", icon: "✅" },
};

export default function ConfirmHost() {
  const [state, setState] = useState(null); // { title, message, confirmText, cancelText, tone, resolve }

  useEffect(() => {
    registerConfirmHandler((opts) =>
      new Promise((resolve) => {
        setState({
          title:       opts.title || "Please confirm",
          message:     opts.message || "Are you sure?",
          confirmText: opts.confirmText || "Yes, change it",
          cancelText:  opts.cancelText || "Cancel",
          tone:        TONES[opts.tone] ? opts.tone : "default",
          resolve,
        });
      })
    );
    return () => registerConfirmHandler(null);
  }, []);

  if (!state) return null;

  const t = TONES[state.tone];
  const close = (val) => { state.resolve(val); setState(null); };

  return (
    <div
      onClick={() => close(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", animation: "cfFade 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "420px", maxWidth: "92vw", background: "#1a1a1a",
          border: "1px solid #2a2a2a", borderRadius: "18px", padding: "26px",
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${t.glow}`,
          fontFamily: globalFont, animation: "cfPop 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
            background: `${t.accent}22`, border: `1px solid ${t.accent}55`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
          }}>
            {t.icon}
          </div>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#fff" }}>
            {state.title}
          </h2>
        </div>

        <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#bbb", lineHeight: 1.6 }}>
          {state.message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={() => close(false)}
            style={{
              padding: "10px 18px", borderRadius: "9px", border: "1px solid #333",
              background: "#222", color: "#ccc", fontWeight: 600, fontSize: "13px",
              cursor: "pointer", fontFamily: globalFont,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#222")}
          >
            {state.cancelText}
          </button>
          <button
            autoFocus
            onClick={() => close(true)}
            style={{
              padding: "10px 20px", borderRadius: "9px", border: "none",
              background: t.accent, color: "#fff", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", fontFamily: globalFont,
              boxShadow: `0 6px 18px ${t.glow}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            {state.confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cfFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cfPop  { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

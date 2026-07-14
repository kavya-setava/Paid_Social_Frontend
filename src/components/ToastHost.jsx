// ToastHost — global, self-contained toast stack.
// Any code can raise a toast with:
//   window.dispatchEvent(new CustomEvent("app-toast", { detail: "message" }));
// Mount it ONCE near the app root.
import React, { useEffect, useState } from "react";

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let counter = 0;
    const onToast = (e) => {
      const id = `${Date.now()}-${counter++}`;
      const message = typeof e.detail === "string" ? e.detail : e.detail?.message || "";
      if (!message) return;
      setToasts((prev) => [...prev, { id, message }]);
      // Auto-dismiss after 6s.
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };
    window.addEventListener("app-toast", onToast);
    return () => window.removeEventListener("app-toast", onToast);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 9999,
      display: "flex", flexDirection: "column", gap: "10px", maxWidth: "360px",
    }}>
      {toasts.map((t) => (
        <div key={t.id}
          onClick={() => dismiss(t.id)}
          style={{
            display: "flex", alignItems: "flex-start", gap: "10px",
            background: "#1a1a1a", border: "1px solid #2a2a2a",
            borderLeft: "3px solid #e50914", borderRadius: "10px",
            padding: "12px 14px", cursor: "pointer",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)", fontFamily: globalFont,
            animation: "toastIn 0.25s ease",
          }}>
          <span style={{ fontSize: "16px", lineHeight: 1 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>
              Notification
            </div>
            <div style={{ fontSize: "12px", color: "#bbb", lineHeight: 1.5 }}>
              {t.message}
            </div>
          </div>
          <span style={{ color: "#555", fontSize: "14px" }}>×</span>
        </div>
      ))}
      <style>{`@keyframes toastIn { from { opacity:0; transform: translateX(20px);} to {opacity:1; transform:none;} }`}</style>
    </div>
  );
}

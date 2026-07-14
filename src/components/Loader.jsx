import React from "react";

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// Centered spinner used while a dashboard loads its tickets for the first time.
export default function Loader({ label = "Loading tickets…" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "72px 0", gap: "18px", width: "100%",
    }}>
      <div style={{ position: "relative", width: "52px", height: "52px" }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "4px solid #2a2a2a",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "4px solid transparent", borderTopColor: "#e50914",
          animation: "ldspin 0.8s linear infinite",
        }} />
      </div>
      <span style={{ color: "#888", fontSize: "13px", fontWeight: 600, fontFamily: globalFont, letterSpacing: "0.03em" }}>
        {label}
      </span>
      <style>{`@keyframes ldspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

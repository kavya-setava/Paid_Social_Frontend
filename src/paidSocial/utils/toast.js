// Tiny dependency-free toast for action feedback across the paid-social
// dashboards. Appends a styled, auto-dismissing pill to the bottom-right.
let container = null;

const ensureContainer = () => {
  if (container && document.body.contains(container)) return container;
  container = document.createElement("div");
  container.className = "ps-toast-container";
  Object.assign(container.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: "9999",
    pointerEvents: "none",
  });
  document.body.appendChild(container);
  return container;
};

const COLORS = {
  success: { bg: "#065f46", bar: "#10b981" },
  error: { bg: "#7f1d1d", bar: "#ef4444" },
  info: { bg: "#1e293b", bar: "#3b82f6" },
};

export const toast = (message, type = "info", duration = 3200) => {
  const root = ensureContainer();
  const { bg, bar } = COLORS[type] || COLORS.info;

  const el = document.createElement("div");
  Object.assign(el.style, {
    minWidth: "220px",
    maxWidth: "360px",
    background: bg,
    color: "#f8fafc",
    borderLeft: `4px solid ${bar}`,
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity .2s ease, transform .2s ease",
    pointerEvents: "auto",
  });
  el.textContent = message;
  root.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });

  const remove = () => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 220);
  };
  setTimeout(remove, duration);
  el.addEventListener("click", remove);
};

export const toastSuccess = (m) => toast(m, "success");
export const toastError = (m) => toast(m, "error");
export const toastInfo = (m) => toast(m, "info");

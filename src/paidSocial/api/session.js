// Paid-Social session storage.
//
// Kept on dedicated localStorage keys (prefixed `ps_`) so the paid-social
// dashboards never collide with the organic-social auth in the same app.
const TOKEN_KEY = "ps_token";
const REFRESH_KEY = "ps_refreshToken";
const USER_KEY = "ps_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
};
export const setRefreshToken = (t) => {
  if (t) localStorage.setItem(REFRESH_KEY, t);
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Persist a full login payload ({ token, refreshToken, user }) into the session.
export const saveSession = ({ token, refreshToken, user }) => {
  if (token) setToken(token);
  if (refreshToken) setRefreshToken(refreshToken);
  if (user) setUser(user);
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

// Update the stored user's presence flags (keeps the overlay/toggles in sync).
export const setPresenceFlags = (isOnline, isOnBreak) => {
  const u = getUser() || {};
  u.isOnline = isOnline;
  u.isOnBreak = isOnBreak;
  setUser(u);
};

// Active role for the logged-in user, upper-cased (e.g. "QM" | "AGENT" | "QC").
export const getActiveRole = () => {
  const u = getUser();
  const name = u?.activeRole?.name || u?.role || "";
  return String(name).trim().toUpperCase();
};

// Route each role lands on after login / role switch.
export const routeForRole = (role) => {
  switch (String(role || "").trim().toUpperCase()) {
    case "QM":
      return "/paid/qm";
    case "AGENT":
      return "/paid/agent";
    case "QC":
      return "/paid/qc";
    default:
      return "/paid/login";
  }
};

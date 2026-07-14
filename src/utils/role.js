// Normalize an active role of ANY shape → uppercase string.
// Handles legacy/stale sessions where `role` was stored as {id,name},
// an array of roles, or a plain string.
export function normalizeRole(role) {
  if (!role) return "";
  if (typeof role === "string") return role.trim().toUpperCase();
  if (Array.isArray(role)) return normalizeRole(role[0]);
  if (typeof role === "object") return normalizeRole(role.name);
  return "";
}

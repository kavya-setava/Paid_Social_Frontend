// Paid-Social API — thin wrappers over every backend endpoint used by the
// QM / Agent / QC dashboards. See socialite_backend/PaidSocial-API-Docs.md.
import http from "./http";

// Helper: turn a params object into a query string, dropping empty values.
const qs = (params = {}) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
};

/* ============================== AUTH ============================== */
export const authApi = {
  // GET /auth/google → { authUrl }
  getGoogleUrl: () => http.get("/auth/google").then((r) => r.data),
  // POST /auth/google/signin { token, role? }
  signin: (token, role) =>
    http.post("/auth/google/signin", { token, ...(role ? { role } : {}) }).then((r) => r.data),
  // POST /auth/switch-role { role }
  switchRole: (role) => http.post("/auth/switch-role", { role }).then((r) => r.data),
  // GET /auth/me
  me: () => http.get("/auth/me").then((r) => r.data),
  // POST /auth/logout
  logout: () => http.post("/auth/logout", {}).then((r) => r.data),
};

/* ============================== QM ============================== */
export const qmApi = {
  // GET /tickets/qm/tickets ?status ?assigned ?search ?page ?limit
  getTickets: (params = {}) => http.get(`/tickets/qm/tickets${qs(params)}`).then((r) => r.data),
  // GET /tickets/operators ?role=AGENT|QC
  getOperators: (role = "AGENT") =>
    http.get(`/tickets/operators${qs({ role })}`).then((r) => r.data),
  // PATCH /tickets/:id/assign { agentId, note }
  assign: (id, agentId, note = "") =>
    http.patch(`/tickets/${id}/assign`, { agentId, note }).then((r) => r.data),
};

/* ============================== AGENT ============================== */
export const agentApi = {
  // GET /tickets/agent/tickets ?status ?search ?page ?limit
  getTickets: (params = {}) => http.get(`/tickets/agent/tickets${qs(params)}`).then((r) => r.data),
  start: (id, note = "") => http.patch(`/tickets/${id}/start`, { note }).then((r) => r.data),
  hold: (id, type = "HOLD", note = "") =>
    http.patch(`/tickets/${id}/hold`, { type, note }).then((r) => r.data),
  resume: (id, note = "") => http.patch(`/tickets/${id}/resume`, { note }).then((r) => r.data),
  submit: (id, note = "") => http.patch(`/tickets/${id}/submit`, { note }).then((r) => r.data),
  pickRework: (id) => http.patch(`/tickets/rework/${id}/pick`, {}).then((r) => r.data),
};

/* ============================== QC ============================== */
export const qcApi = {
  // GET /tickets/qc/pool — unclaimed READY_TO_QC pool
  getPool: (params = {}) => http.get(`/tickets/qc/pool${qs(params)}`).then((r) => r.data),
  // GET /tickets/qc/all — shared region-wide ALL board
  getBoard: (params = {}) => http.get(`/tickets/qc/all${qs(params)}`).then((r) => r.data),
  // GET /tickets/qc/tickets — my QC tickets
  getMyTickets: (params = {}) => http.get(`/tickets/qc/tickets${qs(params)}`).then((r) => r.data),
  // PATCH /tickets/:id/qc-pick — claim (ticket stays READY_TO_QC)
  pick: (id) => http.patch(`/tickets/${id}/qc-pick`, {}).then((r) => r.data),
  // PATCH /tickets/:id/qc-start — begin review (READY_TO_QC → IN_QC, timer starts)
  start: (id) => http.patch(`/tickets/${id}/qc-start`, {}).then((r) => r.data),
  approve: (id, note = "", qcObservations = "") =>
    http.patch(`/tickets/${id}/qc-approve`, { note, qcObservations }).then((r) => r.data),
  reject: (id, feedback, errorTags = [], qcObservations = "") =>
    http
      .patch(`/tickets/${id}/qc-reject`, { feedback, errorTags, qcObservations })
      .then((r) => r.data),
  hold: (id, type = "HOLD", note = "") =>
    http.patch(`/tickets/${id}/hold`, { type, note }).then((r) => r.data),
  resume: (id, note = "") => http.patch(`/tickets/${id}/resume`, { note }).then((r) => r.data),
};

/* ============================== SHARED ============================== */
export const ticketApi = {
  // GET /tickets/:id — full detail + populated history
  getById: (id) => http.get(`/tickets/${id}`).then((r) => r.data),
  // GET /tickets/rework ?mine=available|history|all
  getRework: (mine = "available") =>
    http.get(`/tickets/rework${qs({ mine })}`).then((r) => r.data),
  // GET /tickets/my/tickets — caller's own queue by active role
  getMyQueue: () => http.get("/tickets/my/tickets").then((r) => r.data),
  // PATCH /tickets/:id/fields — role-scoped field edits
  updateFields: (id, fields) => http.patch(`/tickets/${id}/fields`, fields).then((r) => r.data),
};

// Normalize an axios error into a { success:false, message } shape the UI can
// display directly, matching the backend's own error envelope.
export const errMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

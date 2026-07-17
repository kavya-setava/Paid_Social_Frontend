// Ticket helpers shared by the QM / Agent / QC dashboards:
//  - status → UI label / css class
//  - live UT timer maths (§5 of the API docs)
//  - normalizeTicket(): flattens a backend ticket into the flat shape the
//    existing table components already render.

/* ------------------------------ status ------------------------------ */
export const STATUS = {
  RTT: "RTT",
  IN_PROGRESS: "IN_PROGRESS",
  ON_HOLD: "ON_HOLD",
  READY_TO_QC: "READY_TO_QC",
  IN_QC: "IN_QC",
  REJECTED: "REJECTED",
  TRAFFICKED: "TRAFFICKED",
};

const STATUS_LABELS = {
  RTT: "RTT",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  READY_TO_QC: "Ready to QC",
  IN_QC: "In QC",
  REJECTED: "Rejected",
  TRAFFICKED: "Trafficked",
};

// Human label for a status. Rework count is folded in per the docs:
// REJECTED + reworkCount 2 → "Rejected (Rework 2)".
export const statusLabel = (status, reworkCount = 0) => {
  const base = STATUS_LABELS[status] || status || "—";
  return reworkCount > 0 ? `${base} (Rework ${reworkCount})` : base;
};

// Maps a backend status to the `status-*` css class used by the table styles.
const STATUS_CLASSES = {
  RTT: "status-rtt",
  IN_PROGRESS: "status-in-progress",
  ON_HOLD: "status-on-hold",
  READY_TO_QC: "status-ready-qc",
  IN_QC: "status-in-qc",
  REJECTED: "status-rejected",
  TRAFFICKED: "status-trafficked",
};
export const statusClass = (status) => STATUS_CLASSES[status] || "status-rtt";

/* ------------------------------ time ------------------------------ */
// Banked seconds + the live delta while a timer is running now.
export const liveSeconds = (ticket, role /* "agent" | "qc" */) => {
  const time = ticket?.time || {};
  const base = role === "agent" ? time.agentActiveSeconds : time.qcActiveSeconds;
  const since = role === "agent" ? time.agentRunningSince : time.qcRunningSince;
  const live = since ? Math.floor((Date.now() - new Date(since).getTime()) / 1000) : 0;
  return (base || 0) + Math.max(0, live);
};

export const isTimerRunning = (ticket, role) => {
  const time = ticket?.time || {};
  return role === "agent" ? !!time.agentRunningSince : !!time.qcRunningSince;
};

// Seconds → "HH:MM:SS".
export const fmtDuration = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
};

// Friendly date/time for the many timestamp columns.
export const fmtDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

/* ------------------------------ normalize ------------------------------ */
// Flatten a backend ticket to the keys the tables consume, while keeping the
// raw objects (time/current/status) available under `_raw` for action logic.
export const normalizeTicket = (t = {}) => {
  const current = t.current || {};
  const agentName = current.agent?.name || t.operator || "";
  const qcName = current.qc?.name || "";

  return {
    // identity / control
    id: t._id,
    _id: t._id,
    ticketId: t.ticketId,
    subject: t.campaignName || t.marketingCampaign || t.ticketId || "Ticket",
    status: t.status,
    reworkCount: t.reworkCount || 0,
    priority: t.priority || "",

    // 24 sheet columns → flat keys used by the tables
    taskReceivedTime: fmtDateTime(t.taskReceivedTime),
    marketingCampaign: t.marketingCampaign || "",
    campaignName: t.campaignName || "",
    adSetName: t.adSetName || "",
    adName: t.adName || "",
    highVisibilityTitles: t.highVisibility || "",
    adTech: t.adTech || "",
    taskType: t.taskType || "",
    page: t.page || "",
    platform: t.platform || "",
    region: t.region || "",
    adFlightStart: fmtDateTime(t.flightStart),
    adFlightEnd: fmtDateTime(t.flightEnd),
    flightStart: fmtDateTime(t.flightStart),
    flightEnd: fmtDateTime(t.flightEnd),
    operator: agentName,
    originalOperator: agentName,
    taskAssignedTime: fmtDateTime(t.taskAssignedTime),
    publishDate: fmtDateTime(t.publishDatePST),
    launchingPrioritization: t.launchPriority || t.priority || "",

    // status columns (label folds in rework count)
    taskStatus: statusLabel(t.status, t.reworkCount),

    // notes / QC columns
    socialiteNotes: t.socialiteNotes || "",
    traffickerComments: t.traffickerComments || "",
    qmNotes: t.qmNotes || "",
    agentNotes: t.agentNotes || "",
    qcThread: t.qcThread || "",
    qcer: qcName,
    qcEr: qcName,
    qcStatus: t.qcStatus || statusLabel(t.status, t.reworkCount),
    qcComments: t.qcObservations || t.qcNotes || "",
    qcObservations: t.qcObservations || "",
    reworkReason: t.qcObservations || t.qcNotes || "",

    // UT columns (banked totals, live-aware)
    operatorTimeTaken: fmtDuration(liveSeconds(t, "agent")),
    qcTimeTaken: fmtDuration(liveSeconds(t, "qc")),

    // people (ids power the assign / reassign selects)
    qmName: current.qm?.name || "",
    qmId: current.qm?._id || "",
    agentName,
    agentId: current.agent?._id || "",
    qcName,
    qcId: current.qc?._id || "",

    // raw slices for action/timer logic
    _raw: {
      status: t.status,
      reworkCount: t.reworkCount || 0,
      time: t.time || {},
      current,
      timeline: t.timeline || {},
      holdReturnStatus: t.holdReturnStatus || null, // IN_PROGRESS = agent hold, IN_QC = QC hold
    },
    _ticket: t,
  };
};

export const normalizeList = (arr = []) => arr.map(normalizeTicket);

/* --------------------- QM status tab → API query --------------------- */
export const QM_TAB_QUERY = {
  all: {},
  rttUnassigned: { status: "RTT", assigned: "false" },
  rttAssigned: { status: "RTT", assigned: "true" },
  inProgress: { status: "IN_PROGRESS" },
  onHold: { status: "ON_HOLD" },
  readyToQc: { status: "READY_TO_QC" },
  inQc: { status: "IN_QC" },
  rejected: { status: "REJECTED" },
  rework: { status: "REJECTED" },
  trafficked: { status: "TRAFFICKED" },
};

// Map the backend `counts` envelope to the StatusCards keys each role uses.
export const mapCounts = (counts = {}, extra = {}) => ({
  all: counts.ALL ?? 0,
  rttAssigned: counts.RTT ?? 0,
  rttUnassigned: counts.RTT ?? 0,
  inProgress: counts.IN_PROGRESS ?? 0,
  onHold: counts.ON_HOLD ?? 0,
  readyToQc: counts.READY_TO_QC ?? 0,
  inQc: counts.IN_QC ?? 0,
  rejected: counts.REJECTED ?? 0,
  rework: counts.REJECTED ?? 0,
  trafficked: counts.TRAFFICKED ?? 0,
  ...extra,
});

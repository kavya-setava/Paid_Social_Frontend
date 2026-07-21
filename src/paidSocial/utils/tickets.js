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

/* ---------------------- Calendar Invite status ---------------------- */
export const CI_STATUS = {
  CALENDAR_INVITE: "CALENDAR_INVITE",
  IN_PROGRESS: "CI_IN_PROGRESS",
  READY_TO_QC: "CI_READY_TO_QC",
  IN_QC: "CI_IN_QC",
  COMPLETED: "CI_COMPLETED",
};

const CI_LABELS = {
  CALENDAR_INVITE: "Calendar Invite",
  CI_IN_PROGRESS: "Enable In Progress",
  CI_READY_TO_QC: "Enable Ready to QC",
  CI_IN_QC: "Enable In QC",
  CI_COMPLETED: "Completed",
};
export const ciLabel = (s) => CI_LABELS[s] || s || "—";

const CI_CLASSES = {
  CALENDAR_INVITE: "status-rtt",
  CI_IN_PROGRESS: "status-in-progress",
  CI_READY_TO_QC: "status-ready-qc",
  CI_IN_QC: "status-in-qc",
  CI_COMPLETED: "status-trafficked",
};
export const ciStatusClass = (s) => CI_CLASSES[s] || "status-rtt";

// Live-aware CI TAT (seconds) — counts up while the stage is open.
export const ciAgentSeconds = (ci = {}) => {
  if (!ci.agentStartAt) return 0;
  const end = ci.agentEndAt ? new Date(ci.agentEndAt).getTime() : Date.now();
  return Math.max(0, Math.floor((end - new Date(ci.agentStartAt).getTime()) / 1000));
};
export const ciQcSeconds = (ci = {}) => {
  if (!ci.qcStartAt) return 0;
  const end = ci.qcEndAt ? new Date(ci.qcEndAt).getTime() : Date.now();
  return Math.max(0, Math.floor((end - new Date(ci.qcStartAt).getTime()) / 1000));
};
export const ciAgentRunning = (ci = {}) => !!ci.agentStartAt && !ci.agentEndAt;
export const ciQcRunning = (ci = {}) => !!ci.qcStartAt && !ci.qcEndAt;

/* ------------------------------ time ------------------------------ */
// The workLog entry for the person CURRENTLY on the ticket for this role.
// Per-person time is what the working timer must show: a new picker starts at
// 0; the same person resumes their own total.
const currentWorkEntry = (ticket, role) => {
  const roleKey = role === "agent" ? "AGENT" : "QC";
  const current = ticket?.current || {};
  const person = role === "agent" ? current.agent : current.qc;
  const personId = person?._id || person; // populated doc or raw id
  if (!personId || !Array.isArray(ticket?.workLog)) return null;
  return (
    ticket.workLog.find(
      (w) => w.role === roleKey && String(w.user?._id || w.user) === String(personId)
    ) || null
  );
};

// Live PER-PERSON seconds for the current agent/QC: their banked seconds plus
// the delta since they (re)started, if their timer is running now.
export const liveSeconds = (ticket, role /* "agent" | "qc" */) => {
  const entry = currentWorkEntry(ticket, role);
  if (!entry) return 0;
  const base = entry.seconds || 0;
  const live = entry.lastStartedAt
    ? Math.floor((Date.now() - new Date(entry.lastStartedAt).getTime()) / 1000)
    : 0;
  return base + Math.max(0, live);
};

// Running now? True only while the current person's stint clock is ticking.
export const isTimerRunning = (ticket, role) => {
  const entry = currentWorkEntry(ticket, role);
  return !!entry?.lastStartedAt;
};

// Aggregate hands-on time across everyone who worked the ticket (for QM
// overview columns), live-aware off the global running-since stamps.
export const aggregateSeconds = (ticket, role) => {
  const time = ticket?.time || {};
  const base = role === "agent" ? time.agentActiveSeconds : time.qcActiveSeconds;
  const since = role === "agent" ? time.agentRunningSince : time.qcRunningSince;
  const live = since ? Math.floor((Date.now() - new Date(since).getTime()) / 1000) : 0;
  return (base || 0) + Math.max(0, live);
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

  // A QC-held ticket reads as "QC Hold"; an agent-held one as "On Hold".
  // A trafficked ticket that entered the Calendar Invite flow shows its CI stage.
  const isQcHold = t.status === "ON_HOLD" && t.holdReturnStatus === "IN_QC";
  let taskStatus;
  if (t.status === "TRAFFICKED" && t.isCalendarInvite) taskStatus = ciLabel(t.ciStatus);
  else if (isQcHold) taskStatus = t.reworkCount > 0 ? `QC Hold (Rework ${t.reworkCount})` : "QC Hold";
  else taskStatus = statusLabel(t.status, t.reworkCount);

  const ci = t.ci || {};

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
    country: t.country || "",
    socialiteLink: t.socialiteLink || "",
    adFlightStart: fmtDateTime(t.flightStart),
    adFlightEnd: fmtDateTime(t.flightEnd),
    flightStart: fmtDateTime(t.flightStart),
    flightEnd: fmtDateTime(t.flightEnd),
    operator: agentName,
    originalOperator: agentName,
    taskAssignedTime: fmtDateTime(t.taskAssignedTime || t.timeline?.assignedToAgentAt),
    publishDate: fmtDateTime(t.publishDatePST),
    launchingPrioritization: t.launchPriority || t.priority || "",

    // status columns (label folds in rework count + QC-hold distinction)
    taskStatus,

    // notes / QC columns
    socialiteNotes: t.socialiteNotes || "",
    traffickerComments: t.traffickerComments || "",
    operatorComments: t.traffickerComments || "", // alias: same value as Trafficker Comments
    qmNotes: t.qmNotes || "",
    agentNotes: t.agentNotes || "",
    qcThread: t.qcThread || "",
    tacticalLink: t.tacticalLink || "",
    qcer: qcName,
    qcEr: qcName,
    qcStatus: t.qcStatus || taskStatus,
    qcComments: t.qcObservations || t.qcNotes || "",
    qcObservations: t.qcObservations || "",
    reworkReason: t.qcObservations || t.qcNotes || "",

    // UT columns for QM overview = aggregate hands-on time (all people)
    operatorTimeTaken: fmtDuration(aggregateSeconds(t, "agent")),
    qcTimeTaken: fmtDuration(aggregateSeconds(t, "qc")),

    // people (ids power the assign / reassign selects)
    qmName: current.qm?.name || "",
    qmId: current.qm?._id || "",
    agentName,
    agentId: current.agent?._id || "",
    qcName,
    qcId: current.qc?._id || "",

    // Calendar Invite fields
    isCalendarInvite: !!t.isCalendarInvite,
    ciStatus: t.ciStatus || "",
    ciStatusLabel: ciLabel(t.ciStatus),
    ciAgentName: ci.agent?.name || "",
    ciAgentId: ci.agent?._id || "",
    ciQcName: ci.qc?.name || "",
    ciQcId: ci.qc?._id || "",
    ciAgentStartAt: fmtDateTime(ci.agentStartAt),
    ciAgentEndAt: fmtDateTime(ci.agentEndAt),
    ciQcStartAt: fmtDateTime(ci.qcStartAt),
    ciQcEndAt: fmtDateTime(ci.qcEndAt),

    // raw slices for action/timer logic
    _raw: {
      status: t.status,
      reworkCount: t.reworkCount || 0,
      time: t.time || {},
      current,
      timeline: t.timeline || {},
      holdReturnStatus: t.holdReturnStatus || null, // IN_PROGRESS = agent hold, IN_QC = QC hold
      isCalendarInvite: !!t.isCalendarInvite,
      ciStatus: t.ciStatus || "",
      ci,
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
  onHold: { status: "ON_HOLD", holdReturn: "IN_PROGRESS" },
  qcOnHold: { status: "ON_HOLD", holdReturn: "IN_QC" },
  readyToQc: { status: "READY_TO_QC" },
  inQc: { status: "IN_QC" },
  rejected: { status: "REJECTED" },
  rework: { status: "REJECTED" },
  trafficked: { status: "TRAFFICKED", ciCompleted: "false" }, // trafficked but CI not finished
  completed: { status: "TRAFFICKED", ciCompleted: "true" },   // CI workflow completed
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

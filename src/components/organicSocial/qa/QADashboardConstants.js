// src/components/organicSocial/qa/QADashboardConstants.js

export const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// Metric cards shown in the QA dashboard metrics bar.
// `tab` must match the keys built in QAMetricsBar's counts object.
export const METRIC_CONFIG = [
  {
    tab: 'All',
    label: 'All Tasks',
    icon: '📋',
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: 'rgba(139,92,246,0.35)',
  },
  {
    tab: 'QA In Progress',
    label: 'QA In Progress',
    icon: '⏳',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(249,115,22,0.35)',
  },
  {
    tab: 'QA Passed',
    label: 'QA Passed',
    icon: '✅',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    tab: 'QA Failed',
    label: 'QA Failed',
    icon: '❌',
    gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
    glow: 'rgba(239,68,68,0.35)',
  },
  {
    tab: 'Rework',
    label: 'Rework',
    icon: '🔁',
    gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    glow: 'rgba(59,130,246,0.35)',
  },
];

// Selectable QA statuses in the status dropdown.
export const QA_STATUS_OPTIONS = [
  'QA In Progress',
  'QA Passed',
  'QA Failed',
  'Re-Assigned',
];

// Badge/select styling per QA status.
export const QA_STATUS_STYLES = {
  'QA In Progress': { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
  'QA Passed':      { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'QA Failed':      { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  'Re-Assigned':    { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
};

// QA reviewers available for (re-)assignment.
export const DUMMY_QA_LIST = [
  { value: 'qa_snehitha', label: 'Snehitha' },
  { value: 'qa_sarthak',  label: 'Sarthak' },
  { value: 'qa_nishanth', label: 'Nishanth' },
  { value: 'qa_harsha',   label: 'Harsha' },
];

// Format a duration given in minutes → "2h 15m" / "45m".
export const formatMins = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h > 0 ? `${h}h ${rem}m` : `${rem}m`;
};

// Format elapsed seconds → "HH:MM:SS" / "MM:SS".
export const formatTimer = (secs) => {
  const s = Math.max(0, Math.floor(secs || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

export const DUMMY_QA_TICKETS = [
  {
    id: 'QA-001',
    taskName: 'Netflix Korea Shorts Upload',
    taskType: 'AV Single Post',
    assignedAgent: 'Snehitha',
    qaStatus: 'Pending Review',
    visibility: 'Yes',
    qaComment: '',
    taskReceivedTime: new Date().toISOString(),
    publishDateRaw: new Date(Date.now() + 86400000).toISOString(),
    socialiteLink: 'https://example.com/socialite/1',
  },
  {
    id: 'QA-002',
    taskName: 'Global Debut AV Post',
    taskType: 'AV Global Debut',
    assignedAgent: 'Sarthak',
    qaStatus: 'Approved',
    visibility: 'No',
    qaComment: 'Looks good!',
    taskReceivedTime: new Date(Date.now() - 3600000).toISOString(),
    publishDateRaw: new Date(Date.now() + 172800000).toISOString(),
    socialiteLink: 'https://example.com/socialite/2',
  },
  {
    id: 'QA-003',
    taskName: 'Community Post - France',
    taskType: 'France Community',
    assignedAgent: 'Nishanth',
    qaStatus: 'QA Fail',
    visibility: 'No',
    qaComment: 'Missing thumbnail',
    taskReceivedTime: new Date(Date.now() - 7200000).toISOString(),
    publishDateRaw: new Date(Date.now() + 259200000).toISOString(),
    socialiteLink: '',
  },
  {
    id: 'QA-004',
    taskName: 'Thumbnail Creation - Anime',
    taskType: 'Thumbnail Creation',
    assignedAgent: 'Harsha',
    qaStatus: 'Re-Assigned',
    visibility: 'Yes',
    qaComment: '',
    taskReceivedTime: new Date(Date.now() - 10800000).toISOString(),
    publishDateRaw: new Date(Date.now() + 345600000).toISOString(),
    socialiteLink: 'https://example.com/socialite/4',
  },
  {
    id: 'QA-005',
    taskName: 'Japan Feed - Weekly',
    taskType: 'Japan-Feed',
    assignedAgent: 'Snehitha',
    qaStatus: 'Approved',
    visibility: 'No',
    qaComment: 'All verified',
    taskReceivedTime: new Date(Date.now() - 86400000).toISOString(),
    publishDateRaw: new Date(Date.now() - 3600000).toISOString(),
    socialiteLink: 'https://example.com/socialite/5',
  },
];
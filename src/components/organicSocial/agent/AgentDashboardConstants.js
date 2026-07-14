// ── Agent Only Trafficking Options ──
export const AGENT_TRAFFICKING_OPTIONS = [
  'In Progress',
  'Completed',
  'Flagged'
];

export const SCHEDULED_PLATFORM_OPTIONS = ['Desktop', 'Mobile', 'Sprinklr'];

export const TRAFFICKING_STYLES = {
  'In Progress': { bg: '#3a0a0a', color: '#e50914' },
  'Completed':   { bg: '#0a1a0a', color: '#22c55e' },
  'On Hold':     { bg: '#2a2a2a', color: '#757575' },
  'Flagged':     { bg: '#2a1a00', color: '#fb923c' },
};

export const PLATFORM_STYLES = {
  'Desktop':  { bg: '#0a1a2a', color: '#60a5fa' },
  'Mobile':   { bg: '#0a2a1a', color: '#34d399' },
  'Sprinklr': { bg: '#1a0a2a', color: '#c084fc' },
};

export const METRIC_CONFIG = [
  {
    label: 'My Tickets',  tab: 'All',
    gradient: 'linear-gradient(135deg,#e50914,#b91c1c)',
    glow: 'rgba(229,9,20,0.3)',   icon: '🎫'
  },
  {
    label: 'In Progress', tab: 'In Progress',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    glow: 'rgba(59,130,246,0.3)', icon: '⚡'
  },
  {
    label: 'Completed',   tab: 'Completed',
    gradient: 'linear-gradient(135deg,#22c55e,#15803d)',
    glow: 'rgba(34,197,94,0.3)',  icon: '✅'
  },
  {
    label: 'On Hold',     tab: 'On Hold',
    gradient: 'linear-gradient(135deg,#6b7280,#374151)',
    glow: 'rgba(107,114,128,0.3)',icon: '⏸️'
  },
  {
    label: 'Flagged',     tab: 'Flagged',
    gradient: 'linear-gradient(135deg,#fb923c,#ea580c)',
    glow: 'rgba(251,146,60,0.3)', icon: '🚩'
  },
];

export const DUMMY_TICKETS = [
  {
    _id: 't1', id: 'TKT-001',
    taskName: 'Netflix Korea Shorts Upload',
    taskType: 'AV Single Post',
    status: 'Assigned', traffickingStatus: '',
    operator: 'Snehitha', visibility: 'Yes',
    noOfAssets: 1, scheduledPlatform: 'Desktop',
    taskReceivedTime: new Date().toISOString(),
    publishDateRaw: new Date(Date.now() + 86400000).toISOString(),
    socialiteLink: 'https://example.com/1',
    comments: [{ type: 'QM', message: 'Priority task - handle ASAP' }],
    agentMinutes: 0, qaMinutes: 0
  },
  {
    _id: 't2', id: 'TKT-002',
    taskName: 'Global Debut AV Post',
    taskType: 'AV Global Debut',
    status: 'In Progress', traffickingStatus: 'In Progress',
    operator: 'Snehitha', visibility: 'No',
    noOfAssets: 2, scheduledPlatform: 'Sprinklr',
    taskReceivedTime: new Date(Date.now() - 3600000).toISOString(),
    publishDateRaw: new Date(Date.now() + 172800000).toISOString(),
    socialiteLink: 'https://example.com/2',
    comments: [],
    agentMinutes: 35, qaMinutes: 0
  },
  {
    _id: 't3', id: 'TKT-003',
    taskName: 'Community Post - France',
    taskType: 'France Community',
    status: 'Completed', traffickingStatus: 'Completed',
    operator: 'Snehitha', visibility: 'No',
    noOfAssets: 1, scheduledPlatform: 'Mobile',
    taskReceivedTime: new Date(Date.now() - 7200000).toISOString(),
    publishDateRaw: new Date(Date.now() + 259200000).toISOString(),
    socialiteLink: '',
    comments: [
      { type: 'QM', message: 'Urgent delivery' },
      { type: 'Agent', message: 'Completed on time' }
    ],
    agentMinutes: 45, qaMinutes: 12
  },
  {
    _id: 't4', id: 'TKT-004',
    taskName: 'Thumbnail Creation - Anime',
    taskType: 'Thumbnail Creation',
    status: 'On Hold', traffickingStatus: 'On Hold',
    operator: 'Snehitha', visibility: 'Yes',
    noOfAssets: 3, scheduledPlatform: 'Desktop',
    taskReceivedTime: new Date(Date.now() - 10800000).toISOString(),
    publishDateRaw: new Date(Date.now() + 345600000).toISOString(),
    socialiteLink: 'https://example.com/4',
    comments: [],
    agentMinutes: 20, qaMinutes: 0
  },
  {
    _id: 't5', id: 'TKT-005',
    taskName: 'Japan Feed - Weekly',
    taskType: 'Japan-Feed',
    status: 'Flagged', traffickingStatus: 'Flagged',
    operator: 'Snehitha', visibility: 'No',
    noOfAssets: 1, scheduledPlatform: 'Desktop',
    taskReceivedTime: new Date(Date.now() - 86400000).toISOString(),
    publishDateRaw: new Date(Date.now() - 3600000).toISOString(),
    socialiteLink: 'https://example.com/5',
    comments: [{ type: 'Agent', message: 'Asset issue found' }],
    agentMinutes: 15, qaMinutes: 0
  },
];

export const globalFont =
  "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// ── Helper: format minutes ──
export const formatMins = (mins) => {
  if (!mins) return '0m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ── Helper: format seconds to HH:MM:SS ──
export const formatTimer = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};
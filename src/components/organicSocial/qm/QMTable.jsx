import React, { useState } from 'react';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const SOCIALITE_STATUS_OPTIONS = [
  'Posted','Ready To Post','Scheduled','Removed','Cancelled',
  'Draft / Ready For Review','Rescheduled - Re-Work',
  'Takedown Request','Trafficked And Cancelled'
];

const MONDAY_STATUS_OPTIONS = [
  'Posted','Ready To Post','Scheduled','Removed','Cancelled',
  'Draft / Ready For Review','Rescheduled - Re-Work',
  'Takedown Request','Trafficked And Cancelled'
];

const TRAFFICKING_STATUS_OPTIONS = [
  'Yet To Start','In Progress','Completed','Flagged','Cancelled',
  'On Hold','Qm - On Hold','Asset Locked','Rescheduled',
  'Removed','Post Built - Debuts'
];

const SCHEDULED_PLATFORM_OPTIONS = ['Desktop','Mobile','Sprinklr'];
const QM_STATUS_OPTIONS = ['Yet to Assign','Ready to Queue'];

const PLATFORM_COLUMN_OPTIONS = [
  'Instagram','Facebook','X','Tiktok','Threads','Pinterest'
];

const PLACEMENT_OPTIONS = [
  'Instagram Feed','Facebook Feed','X Feed','Instagram Reels',
  'Instagram Story','X Thread','Facebook Story','Facebook Reels',
  'Tiktok Feed','X Retweet','Facebook Cover','Instagram Collab',
  'Facebook A/B Testing','X Website Card','X Cover','Instagram Poll',
  'Twitter Poll','Threads Feed','Ig Bio'
];

const PAGE_OPTIONS = [
  'Netflix Romania','Netflix Türkiye','Netflix Netherlands & Belgium',
  'Netflix Portugal','Netflix Spain','Netflix MENA','Netflix South Africa',
  'Netflix (FI, IS)','Netflix Italy','Netflix (NO)','Netflix (DK)',
  'Netflix Sverige','Netflix Israel','Netflix Germany','Netflix danmark',
  'Netflix Poland','Netflix (SE)','Netflix UK & Ireland','Netflix Nordic'
];

const POST_TYPE_OPTIONS = [
  'Video Post','Single Image Post','Text Post','Carousel(Image + Video)'
];

const DUMMY_AGENTS = [
  { value: 'agent-1', label: 'Snehitha' },
  { value: 'agent-2', label: 'Sarthak' },
  { value: 'agent-3', label: 'Nishanth' },
  { value: 'agent-4', label: 'Harsha' },
];

// ── Style Maps ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  'Pending':        { bg: '#2a2010', color: '#f5a623' },
  'Yet to Start':   { bg: '#0a1a2a', color: '#3b82f6' },
  'In Progress':    { bg: '#3a0a0a', color: '#e50914' },
  'On Hold':        { bg: '#2a2a2a', color: '#757575' },
  'Yet to Assign':  { bg: '#2a2010', color: '#f5a623' },
  'Handoff':        { bg: '#0a2a10', color: '#4ade80' },
  'Completed':      { bg: '#0a1a0a', color: '#22c55e' },
  'Cancelled':      { bg: '#2a0a0a', color: '#ef4444' },
  'Assigned':       { bg: '#0a1a2a', color: '#3b82f6' },
  'Ready to Queue': { bg: '#2a2000', color: '#eab308' },
  'Pushed to QA':   { bg: '#2a0a1a', color: '#ec4899' },
  'QA Done':        { bg: '#0a2010', color: '#86efac' },
};

const TRAFFICKING_STYLES = {
  'Completed':           { bg: '#0a1a0a', color: '#22c55e' },
  'In Progress':         { bg: '#3a0a0a', color: '#e50914' },
  'Yet To Start':        { bg: '#2a2010', color: '#f5a623' },
  'Flagged':             { bg: '#2a1a00', color: '#fb923c' },
  'Cancelled':           { bg: '#2a0a0a', color: '#ef4444' },
  'On Hold':             { bg: '#2a2a2a', color: '#757575' },
  'Qm - On Hold':        { bg: '#1a0a2a', color: '#a78bfa' },
  'Asset Locked':        { bg: '#0a1a2a', color: '#60a5fa' },
  'Rescheduled':         { bg: '#1a1a0a', color: '#fbbf24' },
  'Removed':             { bg: '#1a0a0a', color: '#f87171' },
  'Post Built - Debuts': { bg: '#0a2a1a', color: '#4ade80' },
};

const SOCIALITE_STYLES = {
  'Posted':                  { bg: '#0a1a0a', color: '#22c55e' },
  'Ready To Post':           { bg: '#2a2000', color: '#eab308' },
  'Scheduled':               { bg: '#0a1a2a', color: '#60a5fa' },
  'Removed':                 { bg: '#1a0a0a', color: '#f87171' },
  'Cancelled':               { bg: '#2a0a0a', color: '#ef4444' },
  'Draft / Ready For Review':{ bg: '#2a1a00', color: '#fb923c' },
  'Rescheduled - Re-Work':   { bg: '#1a1a0a', color: '#fbbf24' },
  'Takedown Request':        { bg: '#1a0a2a', color: '#c084fc' },
  'Trafficked And Cancelled':{ bg: '#2a0a0a', color: '#fca5a5' },
};

const PLATFORM_STYLES = {
  'Desktop':  { bg: '#0a1a2a', color: '#60a5fa' },
  'Mobile':   { bg: '#0a2a1a', color: '#34d399' },
  'Sprinklr': { bg: '#1a0a2a', color: '#c084fc' },
};

const PLATFORM_COLUMN_STYLES = {
  'Instagram': { bg: '#2a0a1a', color: '#f472b6' },
  'Facebook':  { bg: '#0a1a2a', color: '#60a5fa' },
  'X':         { bg: '#1a1a1a', color: '#e5e5e5' },
  'Tiktok':    { bg: '#0a2a2a', color: '#2dd4bf' },
  'Threads':   { bg: '#1a0a2a', color: '#a78bfa' },
  'Pinterest': { bg: '#2a0a0a', color: '#f87171' },
};

const PLACEMENT_STYLES = {
  'Instagram Feed':       { bg: '#2a0a1a', color: '#f472b6' },
  'Facebook Feed':        { bg: '#0a1a2a', color: '#60a5fa' },
  'X Feed':               { bg: '#1a1a1a', color: '#e5e5e5' },
  'Instagram Reels':      { bg: '#1a0a2a', color: '#c084fc' },
  'Instagram Story':      { bg: '#2a0a1a', color: '#fb7185' },
  'X Thread':             { bg: '#1a1a2a', color: '#93c5fd' },
  'Facebook Story':       { bg: '#0a1a2a', color: '#3b82f6' },
  'Facebook Reels':       { bg: '#0a1a3a', color: '#60a5fa' },
  'Tiktok Feed':          { bg: '#0a2a2a', color: '#2dd4bf' },
  'X Retweet':            { bg: '#1a2a2a', color: '#67e8f9' },
  'Facebook Cover':       { bg: '#0a1a1a', color: '#34d399' },
  'Instagram Collab':     { bg: '#2a1a0a', color: '#fb923c' },
  'Facebook A/B Testing': { bg: '#0a2a0a', color: '#4ade80' },
  'X Website Card':       { bg: '#1a1a0a', color: '#fbbf24' },
  'X Cover':              { bg: '#2a2a1a', color: '#facc15' },
  'Instagram Poll':       { bg: '#2a0a2a', color: '#e879f9' },
  'Twitter Poll':         { bg: '#0a1a2a', color: '#7dd3fc' },
  'Threads Feed':         { bg: '#1a0a2a', color: '#a78bfa' },
  'Ig Bio':               { bg: '#2a0a1a', color: '#f9a8d4' },
};

const POST_TYPE_STYLES = {
  'Video Post':              { bg: '#2a0a0a', color: '#f87171' },
  'Single Image Post':       { bg: '#0a1a2a', color: '#60a5fa' },
  'Text Post':               { bg: '#1a1a0a', color: '#fbbf24' },
  'Carousel(Image + Video)': { bg: '#0a2a1a', color: '#4ade80' },
};

// ── Reusable Inline Select ─────────────────────────────────────────────────
const InlineSelect = ({ value, options, onChange, styleMap }) => {
  const s = styleMap?.[value] || { bg: '#222', color: '#888' };
  // Ensure a saved value that's outside this list still displays.
  const opts = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '5px 8px', borderRadius: '6px',
        border: `1px solid ${s.color}44`,
        background: s.bg, color: s.color,
        fontSize: '11px', fontWeight: '700',
        cursor: 'pointer', outline: 'none',
        fontFamily: globalFont, minWidth: '120px'
      }}
    >
      {!value && <option value="">— Select —</option>}
      {opts.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
};

// ── Read-only value badge (used when the API already provides the value) ────
const ReadOnlyBadge = ({ value, styleMap }) => {
  const s = styleMap?.[value] || { bg: '#0a1a2a', color: '#60a5fa' };
  return (
    <span style={{
      display: 'inline-block', padding: '5px 10px', borderRadius: '6px',
      background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700',
      fontFamily: globalFont, whiteSpace: 'nowrap'
    }}>
      {value}
    </span>
  );
};

// ── Creator Team Text Input ────────────────────────────────────────────────
const CreatorTeamInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Enter team name..."
      style={{
        padding: '6px 10px',
        borderRadius: '6px',
        border: `1px solid ${focused ? '#60a5fa66' : '#2a2a2a'}`,
        background: focused ? '#0a1a2a' : '#1a1a1a',
        color: focused ? '#93c5fd' : '#aaa',
        fontSize: '12px',
        fontWeight: '500',
        outline: 'none',
        fontFamily: globalFont,
        minWidth: '160px',
        maxWidth: '200px',
        transition: 'all 0.2s ease',
        cursor: 'text',
      }}
    />
  );
};

// ── Operator Dropdown ──────────────────────────────────────────────────────
// `operators` = live AGENT users from the API ([{ _id, name, email }]).
// Disabled until the QM has moved the ticket to "Yet to Start" (backend
// blocks assignment while the ticket is still NEW/Pending).
const OperatorSelect = ({ value, onChange, currentOperator, operators = [], disabled }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    title={disabled ? 'Move status to "Yet to Start" before assigning' : undefined}
    style={{
      padding: '6px 10px', borderRadius: '6px',
      border: '1px solid #444', background: disabled ? '#181818' : '#222',
      color: disabled ? '#555' : '#fff', fontSize: '12px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none', fontFamily: globalFont,
      minWidth: '120px', maxWidth: '150px'
    }}
  >
    <option value="">{currentOperator || 'Unassigned'}</option>
    {operators.map(a => (
      <option key={a._id} value={a._id}>{a.name}</option>
    ))}
  </select>
);

// ── Comment Cell ───────────────────────────────────────────────────────────
const CommentCell = ({ comments, onView }) => {
  if (!comments || comments.length === 0)
    return <span style={{ color: '#6b7280', fontSize: '12px' }}>—</span>;
  return (
    <span
      onClick={() => onView(comments.map(c => c.message || c).join('\n\n'))}
      style={{
        color: '#e50914', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
    >
      View ({comments.length})
    </span>
  );
};

// ── Format minutes helper ──────────────────────────────────────────────────
const formatMins = (mins) => {
  if (!mins && mins !== 0) return '—';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ── Utilization Cell ───────────────────────────────────────────────────────
const UtilizationCell = ({ ticket }) => {
  const [hovered, setHovered] = useState(null);
  const agentTime = ticket.agentMinutes ?? 0;
  const qaTime    = ticket.qaMinutes    ?? 0;
  const total     = agentTime + qaTime;

  if (total === 0) {
    return (
      <div style={{ minWidth: '160px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '6px', marginBottom: '6px'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '999px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            <span style={{ fontSize: '10px' }}>👤</span>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: '#3b82f688', fontFamily: globalFont
            }}>Agent: —</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '999px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)'
          }}>
            <span style={{ fontSize: '10px' }}>🔍</span>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: '#22c55e88', fontFamily: globalFont
            }}>QA: —</span>
          </div>
        </div>
        <span style={{
          fontSize: '10px', color: '#333', fontFamily: globalFont
        }}>Not started</span>
      </div>
    );
  }

  const segments = [
    ...(agentTime > 0 ? [{
      key: 'agent', label: 'Agent', icon: '👤',
      time: agentTime, color: '#3b82f6',
      lightColor: 'rgba(59,130,246,0.15)',
      borderColor: 'rgba(59,130,246,0.3)',
      pct: Math.round((agentTime / total) * 100)
    }] : []),
    ...(qaTime > 0 ? [{
      key: 'qa', label: 'QA', icon: '🔍',
      time: qaTime, color: '#22c55e',
      lightColor: 'rgba(34,197,94,0.15)',
      borderColor: 'rgba(34,197,94,0.3)',
      pct: Math.round((qaTime / total) * 100)
    }] : []),
  ];

  return (
    <div style={{ minWidth: '180px' }}>
      <div style={{
        display: 'flex', height: '5px', borderRadius: '999px',
        overflow: 'hidden', marginBottom: '8px',
        background: '#2a2a2a', gap: '1px'
      }}>
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            title={`${seg.label}: ${formatMins(seg.time)}`}
            style={{
              width: `${seg.pct}%`, background: seg.color,
              opacity: hovered === null || hovered === i ? 1 : 0.25,
              transition: 'opacity 0.2s ease', cursor: 'pointer',
              borderRadius: i === 0 ? '999px 0 0 999px'
                : i === segments.length - 1 ? '0 999px 999px 0' : '0'
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>
      <div style={{
        display: 'flex', gap: '6px',
        flexWrap: 'wrap', marginBottom: '5px'
      }}>
        {segments.map((seg, i) => (
          <div
            key={seg.key}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '4px', padding: '3px 8px', borderRadius: '999px',
              background: hovered === i ? seg.lightColor : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hovered === i ? seg.borderColor : '#2a2a2a'}`,
              cursor: 'default', transition: 'all 0.2s ease',
              opacity: hovered === null || hovered === i ? 1 : 0.4
            }}
          >
            <span style={{ fontSize: '10px' }}>{seg.icon}</span>
            <span style={{
              fontSize: '10px', fontWeight: '700',
              color: seg.color, fontFamily: globalFont, whiteSpace: 'nowrap'
            }}>{seg.label}</span>
            <span style={{
              fontSize: '10px', fontWeight: '600',
              color: '#888', fontFamily: globalFont
            }}>{formatMins(seg.time)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          fontSize: '9px', color: '#6b7280', fontFamily: globalFont,
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>Total</span>
        <span style={{
          fontSize: '11px', fontWeight: '800',
          color: '#666', fontFamily: globalFont
        }}>{formatMins(total)}</span>
      </div>
    </div>
  );
};

// ── Main Table ─────────────────────────────────────────────────────────────
const QMTable = ({
  tickets,
  activeTab,
  operators = [],
  onQmStatusChange,
  onUpdateField,
  onStatusChange,
  onOpenAssign,
  onAssign,
  onReopen,
  onQAFailReassign,
  onViewComment
}) => {
  const [agentSelections, setAgentSelections]   = useState({});
  const [socialiteStatus, setSocialiteStatus]   = useState({});
  const [mondayStatus, setMondayStatus]         = useState({});
  const [traffickingStatus, setTraffickingStatus] = useState({});
  const [scheduledPlatform, setScheduledPlatform] = useState({});
  const [platformColumn, setPlatformColumn]     = useState({});
  const [placementColumn, setPlacementColumn]   = useState({});
  const [pageColumn, setPageColumn]             = useState({});
  const [postTypeColumn, setPostTypeColumn]     = useState({});
  const [creatorTeamInput, setCreatorTeamInput] = useState({});

  // ── Status always shown (no conditional hiding) ──────────────────────
  // showStatusCol removed — Status is now ALWAYS rendered after Operator

  const getByType = (comments, type) =>
    Array.isArray(comments)
      ? comments.filter(c => c?.type?.toLowerCase() === type.toLowerCase())
      : [];

  const formatDate = (raw) => {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      return d.toLocaleString('en-US', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return '—'; }
  };

  const thStyle = {
    padding: '12px 14px',
    fontSize: '10px', fontWeight: '700',
    color: '#9ca3af', textTransform: 'uppercase',
    letterSpacing: '0.08em', whiteSpace: 'nowrap',
    position: 'sticky', top: 0,
    background: '#161616', zIndex: 2,
    borderBottom: '2px solid #2a2a2a'
  };

  // ── NEW Column Order ──────────────────────────────────────────────────
  // Received | Publish Date | Socialite Link | Task Name | High Vis |
  // Socialite Status | Monday Status | Trafficking Status | Scheduled Platform |
  // Platform | Placement | Page | Post Type |
  // Creator Team on Socialite | Operator | Status ← moved here
  // Utilization | QM Notes | QA Notes | Agent Notes

  const headers = [
    'Received', 'Publish Date', 'Socialite Link', 'Task Name', 'High Vis',
    'Socialite Status', 'Monday Status', 'Monday Status Link', 'Trafficking Status', 'Scheduled Platform',
    'Platform', 'Placement', 'Page', 'Post Type',
    'Creator Team on Socialite',
    'Operator',
    'Status',   // ← always shown, placed after Operator
    'Utilization (Agent & QA)',
    'QM Notes', 'QA Notes', 'Agent Notes',
  ];

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{
        width: '100%', minWidth: '2600px',
        borderCollapse: 'collapse',
        textAlign: 'left', fontFamily: globalFont
      }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{
                padding: '48px', textAlign: 'center',
                color: '#6b7280', fontSize: '14px'
              }}>
                No tickets found
              </td>
            </tr>
          ) : tickets.map((ticket) => {
            const tid = ticket._id || ticket.id;
            const qmC = getByType(ticket.comments, 'QM');
            const qaC = getByType(ticket.comments, 'QA');
            const agC = getByType(ticket.comments, 'Agent');
            const st  = STATUS_STYLES[ticket.status] || { bg: '#2a2a2a', color: '#aaa' };
            const selectedAgent = agentSelections[tid];

            return (
              <tr
                key={tid}
                style={{
                  borderBottom: '1px solid #1e1e1e',
                  background: '#1a1a1a', transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#202020'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
              >
                {/* Received */}
                <td style={{
                  padding: '12px 14px', fontSize: '12px',
                  color: '#aab0bb', whiteSpace: 'nowrap'
                }}>
                  {formatDate(ticket.taskReceivedTime || ticket.receivedFull)}
                </td>

                {/* Publish Date */}
                <td style={{
                  padding: '12px 14px', fontSize: '12px',
                  color: '#e50914', fontWeight: '700', whiteSpace: 'nowrap'
                }}>
                  {formatDate(ticket.publishDateRaw)}
                </td>

                {/* Socialite Link */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.socialiteLink ? (
                    <span
                      onClick={() => window.open(ticket.socialiteLink, '_blank')}
                      style={{
                        color: '#60a5fa', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      ********
                    </span>
                  ) : <span style={{ color: '#6b7280' }}>—</span>}
                </td>

                {/* Task Name */}
                <td style={{
                  padding: '12px 14px', fontSize: '13px', color: '#e5e5e5',
                  maxWidth: '200px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {ticket.taskName || '—'}
                </td>

                {/* High Vis */}
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '5px',
                    fontSize: '11px', fontWeight: '700',
                    background: ticket.visibility === 'Yes' ? '#7f1d1d' : '#222',
                    color: ticket.visibility === 'Yes' ? '#ef4444' : '#9ca3af'
                  }}>
                    {ticket.visibility || 'No'}
                  </span>
                </td>

                {/* Socialite Status — persisted */}
                <td style={{ padding: '12px 14px' }}>
                  <InlineSelect
                    value={ticket.socialiteStatus || ''}
                    options={SOCIALITE_STATUS_OPTIONS}
                    onChange={(v) => onUpdateField(ticket, { socialiteStatus: v })}
                    styleMap={SOCIALITE_STYLES}
                  />
                </td>

                {/* Monday Status — persisted */}
                <td style={{ padding: '12px 14px' }}>
                  <InlineSelect
                    value={ticket.mondayStatus || ''}
                    options={MONDAY_STATUS_OPTIONS}
                    onChange={(v) => onUpdateField(ticket, { mondayStatus: v })}
                    styleMap={SOCIALITE_STYLES}
                  />
                </td>

                {/* Monday Status Link — read-only (entered by the agent) */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.mondayStatusLink ? (
                    <span
                      onClick={() => window.open(ticket.mondayStatusLink, '_blank')}
                      style={{ color: '#60a5fa', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      🔗 Open
                    </span>
                  ) : <span style={{ color: '#6b7280' }}>—</span>}
                </td>

                {/* Trafficking Status — selecting "Yet To Start" on a Pending
                    (NEW) ticket moves it forward (unlocks the Operator dropdown). */}
                <td style={{ padding: '12px 14px' }}>
                  <InlineSelect
                    value={ticket.traffickingStatus || ''}
                    options={TRAFFICKING_STATUS_OPTIONS}
                    onChange={(v) => {
                      onUpdateField(ticket, { traffickingStatus: v });
                      if (v === 'Yet To Start' && ticket.apiStatus === 'NEW') {
                        onQmStatusChange(ticket, 'YET_TO_START');
                      }
                    }}
                    styleMap={TRAFFICKING_STYLES}
                  />
                </td>

                {/* Scheduled Platform — persisted */}
                <td style={{ padding: '12px 14px' }}>
                  <InlineSelect
                    value={ticket.scheduledPlatform || ''}
                    options={SCHEDULED_PLATFORM_OPTIONS}
                    onChange={(v) => onUpdateField(ticket, { scheduledPlatform: v })}
                    styleMap={PLATFORM_STYLES}
                  />
                </td>

                {/* Platform — API value (badge) else persisted dropdown */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.platform ? (
                    <ReadOnlyBadge value={ticket.platform} styleMap={PLATFORM_COLUMN_STYLES} />
                  ) : (
                    <InlineSelect
                      value=""
                      options={PLATFORM_COLUMN_OPTIONS}
                      onChange={(v) => onUpdateField(ticket, { platform: v })}
                      styleMap={PLATFORM_COLUMN_STYLES}
                    />
                  )}
                </td>

                {/* Placement — API value (badge) else persisted dropdown */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.placement ? (
                    <ReadOnlyBadge value={ticket.placement} styleMap={PLACEMENT_STYLES} />
                  ) : (
                    <InlineSelect
                      value=""
                      options={PLACEMENT_OPTIONS}
                      onChange={(v) => onUpdateField(ticket, { placement: v })}
                      styleMap={PLACEMENT_STYLES}
                    />
                  )}
                </td>

                {/* Page — API value (badge) else persisted dropdown */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.page ? (
                    <ReadOnlyBadge value={ticket.page} />
                  ) : (
                    <InlineSelect
                      value=""
                      options={PAGE_OPTIONS}
                      onChange={(v) => onUpdateField(ticket, { page: v })}
                      styleMap={Object.fromEntries(
                        PAGE_OPTIONS.map(p => [p, { bg: '#0a1a2a', color: '#60a5fa' }])
                      )}
                    />
                  )}
                </td>

                {/* Post Type — persisted */}
                <td style={{ padding: '12px 14px' }}>
                  <InlineSelect
                    value={ticket.postType || ''}
                    options={POST_TYPE_OPTIONS}
                    onChange={(v) => onUpdateField(ticket, { postType: v })}
                    styleMap={POST_TYPE_STYLES}
                  />
                </td>

                {/* Creator Team on Socialite — direct value from API, else input */}
                <td style={{ padding: '12px 14px' }}>
                  {ticket.creatorTeam ? (
                    <span style={{ fontSize: '12px', color: '#ccc', fontFamily: globalFont }}>
                      {ticket.creatorTeam}
                    </span>
                  ) : (
                    <CreatorTeamInput
                      value={creatorTeamInput[tid] || ''}
                      onChange={(v) => setCreatorTeamInput(p => ({ ...p, [tid]: v }))}
                    />
                  )}
                </td>

                {/* Operator — assign an agent (locked until Yet to Start) */}
                <td style={{ padding: '12px 14px' }}>
                  <OperatorSelect
                    value={selectedAgent}
                    currentOperator={ticket.operator}
                    operators={operators}
                    disabled={!['YET_TO_START', 'ASSIGNED'].includes(ticket.apiStatus)}
                    onChange={(v) => {
                      setAgentSelections(p => ({ ...p, [tid]: v }));
                      if (v) onOpenAssign(ticket, v);
                    }}
                  />
                </td>

                {/* ── Status — read-only badge (QM changes status via the
                    Trafficking Status dropdown, not here). ── */}
                <td style={{ padding: '12px 14px' }}>
                  {(() => {
                      const effStatus = ticket.status || 'Pending';
                      const ss = STATUS_STYLES[effStatus] || { bg: '#2a2a2a', color: '#aaa' };
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                          <span style={{
                            padding: '5px 10px', borderRadius: '20px',
                            fontWeight: '700', fontSize: '11px',
                            background: ss.bg, color: ss.color,
                            whiteSpace: 'nowrap'
                          }}>
                            {effStatus}
                          </span>
                          {ticket.reworkCount > 0 && (() => {
                            // Tally rework rounds per agent for this ticket.
                            const tally = {};
                            (ticket.reworkAgents || []).forEach(n => { tally[n] = (tally[n] || 0) + 1; });
                            const parts = Object.entries(tally).map(([n, c]) => `${n} ×${c}`);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '2px 8px', borderRadius: '999px',
                                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                  fontSize: '10px', fontWeight: '700', color: '#f87171'
                                }}>
                                  🔁 Rework ×{ticket.reworkCount}
                                </span>
                                {parts.length > 0 && (
                                  <span style={{ fontSize: '10px', color: '#888', fontFamily: globalFont }}>
                                    {parts.join(', ')}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                  })()}
                </td>

                {/* Utilization */}
                <td style={{ padding: '12px 14px' }}>
                  <UtilizationCell ticket={ticket} />
                </td>

                {/* QM Notes */}
                <td style={{ padding: '12px 14px' }}>
                  <CommentCell comments={qmC} onView={onViewComment} />
                </td>

                {/* QA Notes */}
                <td style={{ padding: '12px 14px' }}>
                  <CommentCell comments={qaC} onView={onViewComment} />
                </td>

                {/* Agent Notes */}
                <td style={{ padding: '12px 14px' }}>
                  <CommentCell comments={agC} onView={onViewComment} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QMTable;
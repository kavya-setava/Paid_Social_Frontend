import React, { useState, useEffect } from 'react';
import {
  AGENT_TRAFFICKING_OPTIONS,
  SCHEDULED_PLATFORM_OPTIONS,
  TRAFFICKING_STYLES,
  PLATFORM_STYLES,
  globalFont,
  formatMins,
  formatTimer
} from './AgentDashboardConstants';
import {
  PLATFORM_COLUMN_OPTIONS,
  PLACEMENT_OPTIONS, PAGE_OPTIONS, POST_TYPE_OPTIONS,
  SOCIALITE_STYLES, PLATFORM_COLUMN_STYLES, POST_TYPE_STYLES, PLACEMENT_STYLE, PAGE_STYLE,
  InlineSelect, ReadOnlyBadge,
} from '../shared/ticketFields';

// Agent-specific limited option sets (per requirement).
const AGENT_SOCIALITE_OPTIONS = ['Posted', 'Scheduled'];
const AGENT_MONDAY_OPTIONS    = ['Scheduled', 'Posted'];

// ── Yes/No Options ─────────────────────────────────────────────────────────
const YES_NO_OPTIONS = ['Yes', 'No'];

const YES_NO_STYLES = {
  'Yes': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  'No':  { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
};

// ── Small action button ─────────────────────────────────────────────────────
const ActionBtn = ({ label, onClick, disabled, bg, color, border }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '6px 12px', borderRadius: '7px',
      border: `1px solid ${disabled ? '#2a2a2a' : border}`,
      background: disabled ? '#181818' : bg,
      color: disabled ? '#555' : color,
      fontSize: '11px', fontWeight: '700',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: globalFont, whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
);

// ── Lifecycle Action Cell — drives the real backend workflow ─────────────────
const AgentActionCell = ({ ticket, qaList, onStart, onPause, onResume, onComplete }) => {
  const [qaId, setQaId] = useState('');
  const s = ticket.apiStatus;

  if (s === 'ASSIGNED') {
    const isRework = ticket.reworkCount > 0;
    return (
      <ActionBtn
        label={isRework ? '▶ Start (Rework)' : '▶ Start'}
        onClick={() => onStart(ticket)}
        bg={isRework ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'}
        color={isRework ? '#f87171' : '#60a5fa'}
        border={isRework ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}
      />
    );
  }

  if (s === 'ON_HOLD') {
    return (
      <ActionBtn
        label="▶ Resume" onClick={() => onResume(ticket)}
        bg="rgba(34,197,94,0.12)" color="#22c55e" border="rgba(34,197,94,0.4)"
      />
    );
  }

  if (s === 'IN_PROGRESS') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '210px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <ActionBtn
            label="☕ Break" onClick={() => onPause(ticket, 'BREAK')}
            bg="rgba(245,158,11,0.12)" color="#f59e0b" border="rgba(245,158,11,0.4)"
          />
          <ActionBtn
            label="⏸ Hold" onClick={() => onPause(ticket, 'HOLD')}
            bg="rgba(167,139,250,0.12)" color="#a78bfa" border="rgba(167,139,250,0.4)"
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <select
            value={qaId}
            onChange={(e) => setQaId(e.target.value)}
            style={{
              padding: '6px 8px', borderRadius: '7px',
              border: '1px solid #333', background: '#222', color: '#fff',
              fontSize: '11px', fontWeight: '600', outline: 'none',
              fontFamily: globalFont, minWidth: '110px', cursor: 'pointer',
            }}
          >
            <option value="">— Pick QA —</option>
            {qaList.map(q => (
              <option key={q._id} value={q._id}>{q.name}</option>
            ))}
          </select>
          <ActionBtn
            label="✅ Complete" disabled={!qaId}
            onClick={() => onComplete(ticket, qaId)}
            bg="rgba(34,197,94,0.12)" color="#22c55e" border="rgba(34,197,94,0.4)"
          />
        </div>
      </div>
    );
  }

  // PENDING_QA / QA_IN_PROGRESS / QA_PASSED / COMPLETED → read-only status
  const map = {
    PENDING_QA:     { t: 'Pushed to QA',   c: '#ec4899', b: '#2a0a1a' },
    QA_IN_PROGRESS: { t: 'QA reviewing',   c: '#a78bfa', b: '#1a0a2a' },
    QA_PASSED:      { t: 'QA passed',      c: '#22c55e', b: '#0a1a0a' },
    COMPLETED:      { t: 'Completed',      c: '#22c55e', b: '#0a1a0a' },
  };
  const m = map[s] || { t: ticket.status, c: '#888', b: '#222' };
  return (
    <span style={{
      padding: '5px 10px', borderRadius: '999px',
      background: m.b, color: m.c, fontSize: '11px',
      fontWeight: '700', whiteSpace: 'nowrap', fontFamily: globalFont,
    }}>
      {m.t}
    </span>
  );
};

// ── Live Timer Hook ────────────────────────────────────────────────────────
const useLiveTimer = (startTime) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) { setElapsed(0); return; }
    const tick = () => {
      const diff = Math.floor(
        (Date.now() - new Date(startTime).getTime()) / 1000
      );
      setElapsed(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
};

// ── Monday Status Link input (agent enters; persists → QM/QA view) ──────────
const MondayLinkInput = ({ ticket, onSave }) => {
  const [val, setVal] = useState(ticket.mondayStatusLink || '');
  const [focused, setFocused] = useState(false);
  useEffect(() => { setVal(ticket.mondayStatusLink || ''); }, [ticket.mondayStatusLink]);

  const commit = () => {
    const v = (val || '').trim();
    if (v !== (ticket.mondayStatusLink || '')) onSave(ticket, v);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '170px' }}>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); commit(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        placeholder="Paste Monday link…"
        style={{
          flex: 1, padding: '6px 10px', borderRadius: '6px',
          border: `1px solid ${focused ? '#60a5fa66' : '#2a2a2a'}`,
          background: focused ? '#0a1a2a' : '#1a1a1a',
          color: focused ? '#93c5fd' : '#aaa',
          fontSize: '12px', outline: 'none', fontFamily: globalFont,
          minWidth: '130px', maxWidth: '200px', transition: 'all 0.2s',
        }}
      />
      {ticket.mondayStatusLink && (
        <span
          title="Open Monday link"
          onClick={() => window.open(ticket.mondayStatusLink, '_blank')}
          style={{ cursor: 'pointer', color: '#60a5fa', fontSize: '14px', flexShrink: 0 }}
        >↗</span>
      )}
    </div>
  );
};

// ── Yes/No Select ──────────────────────────────────────────────────────────
const YesNoSelect = ({ value, onChange }) => {
  const s = YES_NO_STYLES[value] || { bg: '#222', color: '#666', border: '#333' };
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '5px 8px', borderRadius: '6px',
        border: `1px solid ${s.border}`,
        background: s.bg, color: s.color,
        fontSize: '11px', fontWeight: '700',
        cursor: 'pointer', outline: 'none',
        fontFamily: globalFont, minWidth: '65px'
      }}
    >
      {!value && <option value="">—</option>}
      {YES_NO_OPTIONS.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
};

// ── Utilization Cell ───────────────────────────────────────────────────────
const AgentUtilizationCell = ({ ticket, activeStartTime }) => {
  const isRunning   = ticket.apiStatus === 'IN_PROGRESS';
  const liveElapsed = useLiveTimer(isRunning ? activeStartTime : null);

  // Total hands-on time = time banked by the backend (previous segments,
  // breaks/holds excluded) + the segment currently running. So on resume the
  // clock CONTINUES from the accumulated total instead of restarting at 0,
  // and it survives tab close because the backend is the source of truth.
  const bankedSecs = ticket.agentActiveSeconds || 0;
  const liveSecs   = isRunning ? liveElapsed : 0;
  const totalSecs  = bankedSecs + liveSecs;
  const totalMins  = Math.floor(totalSecs / 60);

  if (isRunning) {
    return (
      <div style={{ minWidth: '150px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '6px', marginBottom: '4px'
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#e50914', flexShrink: 0,
            boxShadow: '0 0 8px rgba(229,9,20,0.8)',
            animation: 'timerPulse 1.2s ease-in-out infinite',
            display: 'inline-block'
          }} />
          <span style={{
            fontFamily: 'monospace', fontSize: '14px',
            fontWeight: '800', color: '#e50914',
            letterSpacing: '0.05em'
          }}>
            {formatTimer(totalSecs)}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#555', fontFamily: globalFont }}>
          🔴 Live · total hands-on
        </div>
      </div>
    );
  }

  if (totalMins === 0) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        gap: '5px', padding: '4px 10px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2a2a'
      }}>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>⏱</span>
        <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: globalFont }}>
          Not started
        </span>
      </div>
    );
  }

  const statusColor = TRAFFICKING_STYLES[ticket.traffickingStatus]?.color || '#3b82f6';
  return (
    <div style={{ minWidth: '130px' }}>
      <div style={{
        height: '4px', borderRadius: '999px',
        background: '#2a2a2a', marginBottom: '6px', overflow: 'hidden'
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: statusColor, borderRadius: '999px'
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '12px' }}>👤</span>
        <span style={{
          fontSize: '13px', fontWeight: '800',
          color: statusColor, fontFamily: globalFont
        }}>
          {formatMins(totalMins)}
        </span>
        <span style={{ fontSize: '10px', color: '#6b7280', fontFamily: globalFont }}>
          worked
        </span>
      </div>
    </div>
  );
};

// ── Comment Cell ───────────────────────────────────────────────────────────
const CommentCell = ({ comments, onView }) => {
  const list = Array.isArray(comments) ? comments : [];
  if (list.length === 0)
    return <span style={{ color: '#6b7280', fontSize: '12px' }}>—</span>;
  return (
    <span
      onClick={() => onView(list.map(c => c.message || c).join('\n\n'))}
      style={{
        color: '#e50914', fontSize: '12px',
        fontWeight: '600', cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
    >
      View ({list.length})
    </span>
  );
};

// ── Main Table ─────────────────────────────────────────────────────────────
const AgentTable = ({
  tickets, qaList = [],
  onStart, onPause, onResume, onComplete, onSaveMondayLink, onUpdateField,
  onStatusChange, onViewComment,
}) => {
  const [platformState, setPlatformState]       = useState({});
  const [noOfAssetsState, setNoOfAssetsState]   = useState({});
  const [realtimePosting, setRealtimePosting]   = useState({});
  const [asapPosting, setAsapPosting]           = useState({});
  const [postReview, setPostReview]             = useState({});
  const [plauditFlag, setPlauditFlag]           = useState({});
  // Consolidated local state for the shared field dropdowns (per ticket).
  const [fieldState, setFieldState]             = useState({});
  const getF = (tid, key, fb = '') => fieldState[tid]?.[key] ?? fb;
  const setF = (tid, key, v) =>
    setFieldState(p => ({ ...p, [tid]: { ...(p[tid] || {}), [key]: v } }));
  const placementStyleMap = Object.fromEntries(PLACEMENT_OPTIONS.map(o => [o, PLACEMENT_STYLE]));
  const pageStyleMap      = Object.fromEntries(PAGE_OPTIONS.map(o => [o, PAGE_STYLE]));

  // Trafficking-status dropdown is linked to the real lifecycle:
  //   In Progress → agent-start (from ASSIGNED) or agent-resume (from ON_HOLD)
  //   On Hold     → agent-pause (HOLD) while IN_PROGRESS
  // Anything without a backend transition (e.g. Flagged) stays local.
  const handleTraffickingChange = (ticket, newStatus) => {
    if (newStatus === 'In Progress') {
      if (ticket.apiStatus === 'ASSIGNED') { onStart?.(ticket); return; }
      if (ticket.apiStatus === 'ON_HOLD')  { onResume?.(ticket); return; }
    }
    if (newStatus === 'On Hold' && ticket.apiStatus === 'IN_PROGRESS') {
      onPause?.(ticket, 'HOLD');
      return;
    }
    onStatusChange?.(ticket.id, newStatus);
  };

  const formatDate = (raw) => {
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleString('en-US', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return '—'; }
  };

  const getByType = (comments, type) =>
    Array.isArray(comments)
      ? comments.filter(c => c?.type?.toLowerCase() === type.toLowerCase())
      : [];

  const thStyle = {
    padding: '12px 14px',
    fontSize: '10px', fontWeight: '700',
    color: '#9ca3af', textTransform: 'uppercase',
    letterSpacing: '0.08em', whiteSpace: 'nowrap',
    position: 'sticky', top: 0,
    background: '#161616', zIndex: 2,
    borderBottom: '2px solid #2a2a2a'
  };

  const headers = [
    'Ticket ID',
    'Received',
    'Publish Date',
    'Socialite Link',
    'Task Name',
    'High Vis',
    // ✅ No. of Assets — input
    'No. of Assets',
    // ✅ 4 Yes/No columns from sheet
    'Realtime Posting',
    'ASAP Posting',
    'Post Review',
    'Plaudit Flag',
    // Shared field dropdowns (same set as QM)
    'Socialite Status',
    'Monday Status',
    'Platform',
    'Placement',
    'Page',
    'Post Type',
    'Creator Team on Socialite',
    // Dropdowns
    'Trafficking Status',
    'Scheduled Platform',
    // ✅ Monday status link — agent enters, QM/QA view
    'Monday Status Link',
    // ✅ Lifecycle action (Start / Break / Hold / Resume / Complete)
    'Action',
    // Live timer
    'My Time',
    // Notes
    'QM Notes',
    'Agent Notes'
  ];

  return (
    <>
      <style>{`
        @keyframes timerPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(1.4); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{
          width: '100%', minWidth: '2000px',
          borderCollapse: 'collapse',
          textAlign: 'left', fontFamily: globalFont
        }}>
          <thead>
            <tr>
              {headers.map(h => (
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
              const tid  = ticket._id || ticket.id;
              const qmC  = getByType(ticket.comments, 'QM');
              const agC  = getByType(ticket.comments, 'Agent');
              const ts   = TRAFFICKING_STYLES[ticket.traffickingStatus] || { bg: '#222', color: '#555' };
              const pv   = platformState[tid] || ticket.scheduledPlatform || '';
              const ps   = PLATFORM_STYLES[pv] || { bg: '#222', color: '#888' };

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

                  {/* Ticket ID */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      color: '#60a5fa', fontFamily: 'monospace'
                    }}>
                      {ticket.id}
                    </span>
                  </td>

                  {/* Received */}
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#aab0bb', whiteSpace: 'nowrap' }}>
                    {formatDate(ticket.taskReceivedTime)}
                  </td>

                  {/* Publish Date */}
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#e50914', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {formatDate(ticket.publishDateRaw)}
                  </td>

                  {/* Socialite Link */}
                  <td style={{ padding: '12px 14px' }}>
                    {ticket.socialiteLink ? (
                      <span
                        onClick={() => window.open(ticket.socialiteLink, '_blank')}
                        style={{ color: '#60a5fa', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
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

                  {/* ✅ No. of Assets — number input */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ fontSize: '14px' }}>📦</span>
                      <input
                        type="number"
                        min="0"
                        value={
                          noOfAssetsState[tid] !== undefined
                            ? noOfAssetsState[tid]
                            : (ticket.noOfAssets ?? '')
                        }
                        onChange={(e) =>
                          setNoOfAssetsState(p => ({
                            ...p,
                            [tid]: e.target.value === '' ? '' : Number(e.target.value)
                          }))
                        }
                        onBlur={(e) => {
                          const n = e.target.value === '' ? 0 : Number(e.target.value);
                          if (n !== (ticket.noOfAssets ?? 0)) onUpdateField(ticket, { noOfAssets: n });
                          e.target.style.border = '1px solid #333';
                        }}
                        placeholder="0"
                        style={{
                          width: '55px', padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #333',
                          background: '#222', color: '#fff',
                          fontSize: '13px', fontWeight: '700',
                          outline: 'none', fontFamily: globalFont,
                          textAlign: 'center', transition: 'border 0.2s'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
                      />
                    </div>
                  </td>

                  {/* ✅ Realtime Posting — Yes/No (persisted boolean) */}
                  <td style={{ padding: '12px 14px' }}>
                    <YesNoSelect
                      value={ticket.realtimePosting ? 'Yes' : 'No'}
                      onChange={(v) => onUpdateField(ticket, { realtimePosting: v === 'Yes' })}
                    />
                  </td>

                  {/* ✅ ASAP Posting — Yes/No (persisted boolean) */}
                  <td style={{ padding: '12px 14px' }}>
                    <YesNoSelect
                      value={ticket.asapPosting ? 'Yes' : 'No'}
                      onChange={(v) => onUpdateField(ticket, { asapPosting: v === 'Yes' })}
                    />
                  </td>

                  {/* ✅ Post Review — Yes/No (persisted string) */}
                  <td style={{ padding: '12px 14px' }}>
                    <YesNoSelect
                      value={ticket.postReview || ''}
                      onChange={(v) => onUpdateField(ticket, { postReview: v })}
                    />
                  </td>

                  {/* ✅ Plaudit Flag — Yes/No (persisted boolean) */}
                  <td style={{ padding: '12px 14px' }}>
                    <YesNoSelect
                      value={ticket.plauditFlag ? 'Yes' : 'No'}
                      onChange={(v) => onUpdateField(ticket, { plauditFlag: v === 'Yes' })}
                    />
                  </td>

                  {/* Socialite Status — agent: Posted / Scheduled (persisted) */}
                  <td style={{ padding: '12px 14px' }}>
                    <InlineSelect
                      value={ticket.socialiteStatus || ''}
                      options={AGENT_SOCIALITE_OPTIONS}
                      onChange={(v) => onUpdateField(ticket, { socialiteStatus: v })}
                      styleMap={SOCIALITE_STYLES}
                    />
                  </td>

                  {/* Monday Status — agent: Scheduled / Posted (persisted) */}
                  <td style={{ padding: '12px 14px' }}>
                    <InlineSelect
                      value={ticket.mondayStatus || ''}
                      options={AGENT_MONDAY_OPTIONS}
                      onChange={(v) => onUpdateField(ticket, { mondayStatus: v })}
                      styleMap={SOCIALITE_STYLES}
                    />
                  </td>

                  {/* Platform — API value (badge) else persisted dropdown */}
                  <td style={{ padding: '12px 14px' }}>
                    {ticket.platform ? (
                      <ReadOnlyBadge value={ticket.platform} style={PLATFORM_COLUMN_STYLES[ticket.platform]} />
                    ) : (
                      <InlineSelect
                        value=""
                        options={PLATFORM_COLUMN_OPTIONS}
                        onChange={(v) => onUpdateField(ticket, { platform: v })}
                        styleMap={PLATFORM_COLUMN_STYLES}
                      />
                    )}
                  </td>

                  {/* Placement */}
                  <td style={{ padding: '12px 14px' }}>
                    {ticket.placement ? (
                      <ReadOnlyBadge value={ticket.placement} style={PLACEMENT_STYLE} />
                    ) : (
                      <InlineSelect
                        value=""
                        options={PLACEMENT_OPTIONS}
                        onChange={(v) => onUpdateField(ticket, { placement: v })}
                        styleMap={placementStyleMap}
                      />
                    )}
                  </td>

                  {/* Page */}
                  <td style={{ padding: '12px 14px' }}>
                    {ticket.page ? (
                      <ReadOnlyBadge value={ticket.page} style={PAGE_STYLE} />
                    ) : (
                      <InlineSelect
                        value=""
                        options={PAGE_OPTIONS}
                        onChange={(v) => onUpdateField(ticket, { page: v })}
                        styleMap={pageStyleMap}
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

                  {/* Creator Team on Socialite — read-only value from the API */}
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: '12px', color: ticket.creatorTeam ? '#ccc' : '#444', fontFamily: globalFont }}>
                      {ticket.creatorTeam || '—'}
                    </span>
                  </td>

                  {/* ✅ Trafficking Status — actionable only while the ticket is
                       with the agent; read-only once handed to QA / completed. */}
                  <td style={{ padding: '12px 14px' }}>
                    {(() => {
                      const agentEditable =
                        ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(ticket.apiStatus);
                      return (
                        <select
                          value={ticket.traffickingStatus || ''}
                          disabled={!agentEditable}
                          onChange={(e) => handleTraffickingChange(ticket, e.target.value)}
                          title={agentEditable ? undefined : 'Locked — ticket is with QA / completed'}
                          style={{
                            padding: '6px 10px', borderRadius: '8px',
                            border: `1px solid ${ts.color}44`,
                            background: ts.bg, color: ts.color,
                            fontSize: '12px', fontWeight: '700',
                            cursor: agentEditable ? 'pointer' : 'not-allowed',
                            opacity: agentEditable ? 1 : 0.75,
                            outline: 'none',
                            fontFamily: globalFont, minWidth: '140px'
                          }}
                        >
                          {!ticket.traffickingStatus && (
                            <option value="">— Select Status —</option>
                          )}
                          {AGENT_TRAFFICKING_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>

                  {/* ✅ Scheduled Platform — persisted */}
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={ticket.scheduledPlatform || ''}
                      onChange={(e) => onUpdateField(ticket, { scheduledPlatform: e.target.value })}
                      style={{
                        padding: '6px 10px', borderRadius: '8px',
                        border: `1px solid ${ps.color}44`,
                        background: ps.bg, color: ps.color,
                        fontSize: '12px', fontWeight: '700',
                        cursor: 'pointer', outline: 'none',
                        fontFamily: globalFont, minWidth: '120px'
                      }}
                    >
                      {!ticket.scheduledPlatform && <option value="">— Platform —</option>}
                      {SCHEDULED_PLATFORM_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>

                  {/* ✅ Monday Status Link — agent enters, persists for QM/QA */}
                  <td style={{ padding: '12px 14px' }}>
                    <MondayLinkInput ticket={ticket} onSave={onSaveMondayLink} />
                  </td>

                  {/* ✅ Action — real lifecycle controls */}
                  <td style={{ padding: '12px 14px' }}>
                    <AgentActionCell
                      ticket={ticket}
                      qaList={qaList}
                      onStart={onStart}
                      onPause={onPause}
                      onResume={onResume}
                      onComplete={onComplete}
                    />
                  </td>

                  {/* ✅ My Time — Live Utilization (tracks backend clock) */}
                  <td style={{ padding: '12px 14px' }}>
                    <AgentUtilizationCell
                      ticket={ticket}
                      activeStartTime={ticket.agentRunningSince}
                    />
                  </td>

                  {/* QM Notes */}
                  <td style={{ padding: '12px 14px' }}>
                    <CommentCell comments={qmC} onView={onViewComment} />
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
    </>
  );
};

export default AgentTable;
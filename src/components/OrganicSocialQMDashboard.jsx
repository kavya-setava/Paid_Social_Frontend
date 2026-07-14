import React, { useState, useMemo, useEffect } from 'react';
import QMSidebar from './organicSocial/qm/QMSidebar';
import QMHeader from './organicSocial/qm/QMHeader';
import QMMetricsBar from './organicSocial/qm/QMMetricsBar';
import QMFilters from './organicSocial/qm/QMFilters';
import QMTable from './organicSocial/qm/QMTable';
import QMPagination from './organicSocial/qm/QMPagination';
import { CommentModal, ViewCommentModal, AssignModal } from './organicSocial/qm/QMModals';
import OrganicSocialAgentsView from './organicSocial/qm/OrganicSocialAgentsView';
import useApiCaller from '../utils/hooks/useApicaller';
import useTicketLive from '../utils/hooks/useTicketLive';
import { useAuth } from '../context/AuthContext.Provider';
import Loader from './Loader';
import { confirmDialog } from '../utils/confirm';

const STATUS_MAP_DISPLAY = {
  'Yet to Assign': 'Yet to Assign',
  'Ready to Queue': 'Ready to Queue',
  'Assigned': 'Assigned',
  'On Hold': 'On Hold',
  'In Progress': 'In Progress',
  'Completed': 'Completed',
  'Handoff': 'Handoff',
  'Pushed to QA': 'Pushed to QA',
  'Reassigned': 'Reassigned',
  'QA Fail': 'QA Failed',
  'Reopened': 'Reopened',
  'Calendar Invite': 'Calendar Invite',
};

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// ── API → UI mapping ─────────────────────────────────────────────────────────
// Backend ticket status → the display status the sidebar/table understand.
const QM_API_STATUS_DISPLAY = {
  NEW:            'Pending',        // default — QM hasn't acted yet
  YET_TO_START:   'Yet to Start',   // QM unlocked it for assignment
  ASSIGNED:       'Assigned',       // QM pinned an agent
  IN_PROGRESS:    'In Progress',
  PENDING_QA:     'Pushed to QA',
  QA_IN_PROGRESS: 'QA In Progress',
  QA_PASSED:      'QA Passed',
  QA_FAILED:      'QA Failed',
  COMPLETED:      'Completed',
  ON_HOLD:        'On Hold',
  CANCELLED:      'Cancelled',
};

const secondsToMinutes = (s) => Math.round((s || 0) / 60);
const fmtMins = (mins) => {
  const m = Math.max(0, Math.round(mins || 0));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
};

// Normalize one API ticket into the shape QMTable expects.
// Fields present in the API render directly; anything missing stays ''
// so the table falls back to its editable dropdown.
const normalizeQMTicket = (t) => ({
  _id:              t._id,
  id:               t._id,
  apiStatus:        t.status || 'NEW',                    // raw backend code (for actions/gating)
  status:           QM_API_STATUS_DISPLAY[t.status] || t.status || 'Pending', // display label
  taskName:         t.marketingCampaign || '—',
  operator:         t.current?.agent?.name || '',         // populated agent
  visibility:       t.highVisibility || 'No',
  taskReceivedTime: t.timeline?.createdAt || t.createdAt,
  publishDateRaw:   t.publishDatePST,
  socialiteLink:    t.socialiteLink || '',
  mondayStatusLink: t.mondayStatusLink || '',   // agent-entered link (read-only here)
  platform:         t.platform  || '',
  placement:        t.placement || '',
  page:             t.page      || '',
  creatorTeam:      t.projectTeam || '',
  // Persisted editable status fields (shared across roles)
  socialiteStatus:  t.socialiteStatus || '',
  mondayStatus:     t.mondayStatus || '',
  traffickingStatus:t.traffickingStatus || '',
  scheduledPlatform:t.scheduledPlatform || '',
  postType:         t.postType || '',
  agentMinutes:     secondsToMinutes(t.time?.agentActiveSeconds),
  qaMinutes:        secondsToMinutes(t.time?.qaActiveSeconds),
  reworkCount:      t.reworkCount || 0,   // times QA sent it back
  // Agent for each rework round: AGENT assignments after the initial one
  // (the first AGENT assignment is the original QM assign; each later one is
  // a QA-fail rework, possibly to a different agent).
  reworkAgents:     (Array.isArray(t.assignmentHistory) ? t.assignmentHistory : [])
                      .filter(a => a.role === 'AGENT')
                      .slice(1)
                      .map(a => a.user?.name || 'Unknown'),
  priority:         t.priority,
  comments:         [],
  raw:              t,
});

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function OrganicSocialQMDashboard() {
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [activeTab, setActiveTab]       = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [limit, setLimit]               = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    highVis: [],
    statuses: [],
    dateRange: { start: '', end: '' }
  });

  // Modal state
  const [showCommentModal, setShowCommentModal]   = useState(false);
  const [commentText, setCommentText]             = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedTicketId, setSelectedTicketId]   = useState(null);
  const [viewComment, setViewComment]             = useState({ show: false, text: '' });
  const [assignModal, setAssignModal]             = useState({ show: false, ticket: null, agentId: null });

  // Tickets state (fetched from QM API)
  const { user }              = useAuth();
  const { fetchData }         = useApiCaller();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [operators, setOperators] = useState([]); // AGENT users for assignment

  // Build the backend filter query string from the active filters.
  // Publish Date Range → publishFrom / publishTo (handled server-side).
  const buildQuery = () => {
    const p = new URLSearchParams();
    const { start, end } = filters.dateRange;
    if (start) p.set('publishFrom', start);
    if (end)   p.set('publishTo', end);
    const qs = p.toString();
    return qs ? `?${qs}` : '';
  };

  // ── Load QM tickets (reused after every mutation) ──────────────────────────
  const loadTickets = async () => {
    setLoading(true);
    setLoadError('');
    // Unified endpoint — always the freshest data from the DB for this role.
    const res = await fetchData('get', `organicSocial/tickets/my/tickets${buildQuery()}`);
    if (res?.success && Array.isArray(res.data)) {
      setTickets(res.data.map(normalizeQMTicket));
      setTotal(res.total ?? res.data.length);
    } else {
      setLoadError(res?.message || 'Failed to load tickets');
    }
    setLoading(false);
  };

  // ── Initial load + refetch when the publish-date range changes ─────────────
  useEffect(() => {
    loadTickets();
  }, [filters.dateRange.start, filters.dateRange.end]); // eslint-disable-line react-hooks/exhaustive-deps

  // Operator (agent) list — once.
  useEffect(() => {
    (async () => {
      const res = await fetchData('get', 'organicSocial/tickets/operators');
      if (res?.success && Array.isArray(res.data)) setOperators(res.data);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live updates: refetch the board whenever any of this QM's tickets change.
  useTicketLive(user?.userId || user?.id || user?._id, loadTickets);

  // ── Metrics: All = real total; status tabs counted where present ───────────
  const metrics = useMemo(() => {
    const base = {
      'All':                total || tickets.length,
      'Yet To Start':       0,
      'In Progress':        0,
      'Completed':          0,
      'Flagged':            0,
      'Cancelled':          0,
      'On Hold':            0,
      'Qm - On Hold':       0,
      'Asset Locked':       0,
      'Rescheduled':        0,
      'Removed':            0,
      'Post Built - Debuts':0,
    };
    tickets.forEach((t) => {
      if (base[t.status] !== undefined) base[t.status] += 1;
    });
    // Rework tab counts tickets QA has sent back at least once.
    base['Rework'] = tickets.filter((t) => (t.reworkCount || 0) > 0).length;
    return base;
  }, [tickets, total]);

  // Per-TICKET rework breakdown (for the Rework tab summary): for each ticket
  // that was sent back, which agents worked it and how many rounds each.
  const reworkTickets = useMemo(() => {
    return tickets
      .filter((t) => (t.reworkCount || 0) > 0)
      .map((t) => {
        const tally = {};
        (t.reworkAgents || []).forEach((n) => { tally[n] = (tally[n] || 0) + 1; });
        return {
          id: t._id,
          name: t.taskName || t._id,
          reworkCount: t.reworkCount,
          agents: Object.entries(tally),   // [[name, rounds], …]
          agentMins: t.agentMinutes || 0,  // total agent hands-on time on this ticket
          qaMins: t.qaMinutes || 0,        // total QA time on this ticket
        };
      });
  }, [tickets]);

  // ── Tab Change ────────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery('');
    setShowFilters(false);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = (ticketId, newStatus) => {
    if (newStatus === 'Ready to Queue') {
      setSelectedTicketId(ticketId);
      setPendingStatusChange(newStatus);
      setCommentText('');
      setShowCommentModal(true);
      return;
    }
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t)
    );
  };

  const confirmStatus = () => {
    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicketId ? { ...t, status: pendingStatusChange } : t
      )
    );
    setShowCommentModal(false);
    setCommentText('');
    setSelectedTicketId(null);
    setPendingStatusChange(null);
  };

  const handleTaskTypeChange = (ticketId, newType) => {
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, taskType: newType } : t)
    );
  };

  // QM moves a Pending (NEW) ticket → Yet to Start (YET_TO_START), unlocking assignment.
  const handleQmStatusChange = async (ticket, backendStatus) => {
    const res = await fetchData(
      'patch',
      `organicSocial/tickets/${ticket._id}/status`,
      { status: backendStatus }
    );
    if (res?.success) {
      await loadTickets();
    } else {
      alert(res?.message || 'Status change failed');
    }
  };

  // Persist an editable status field (Socialite/Monday/Trafficking/etc.).
  // Confirms the change, optimistically shows it, saves, then toasts.
  const handleUpdateField = async (ticket, patch) => {
    const desc = Object.values(patch).join(', ');
    const ok = await confirmDialog({
      title: 'Update ticket',
      message: `Change this to "${desc}"?`,
    });
    if (!ok) return;
    setTickets(prev => prev.map(t => (t._id === ticket._id ? { ...t, ...patch } : t)));
    const res = await fetchData('patch', `organicSocial/tickets/${ticket._id}/fields`, patch);
    if (res?.success) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: '✅ Saved' }));
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: `❌ ${res?.message || 'Save failed'}` }));
      loadTickets(); // revert to DB truth on failure
    }
  };

  // QM assigns an agent (YET_TO_START → ASSIGNED) with an optional comment.
  const handleAssign = async (ticket, agentId, note = '') => {
    if (!agentId) { alert('Please select an agent'); return; }
    const res = await fetchData(
      'patch',
      `organicSocial/tickets/${ticket._id}/assign-agent`,
      { agentId, note }
    );
    if (res?.success) {
      // Persist the QM comment on the ticket too (so it shows in QM Notes).
      if (note) {
        await fetchData('patch', `organicSocial/tickets/${ticket._id}/fields`, { qmNotes: note });
      }
      window.dispatchEvent(new CustomEvent('app-toast', { detail: '✅ Assigned' }));
      await loadTickets();
    } else {
      alert(res?.message || 'Assignment failed');
    }
  };

  // Operator dropdown → open the assign-with-comment modal.
  const openAssign = (ticket, agentId) => setAssignModal({ show: true, ticket, agentId });

  const handleReopen = (ticket, agentId) => {
    const reason = prompt('Enter reopen reason:');
    if (!reason) return;
    setTickets(prev =>
      prev.map(t =>
        (t._id === ticket._id || t.id === ticket.id)
          ? { ...t, status: 'Reopened' }
          : t
      )
    );
    alert(`Ticket ${ticket.id} reopened!`);
  };

  const handleQAFailReassign = (ticket, agentId) => {
    if (!agentId) { alert('Please select an agent'); return; }
    setTickets(prev =>
      prev.map(t =>
        (t._id === ticket._id || t.id === ticket.id)
          ? { ...t, operator: agentId, status: 'Reassigned' }
          : t
      )
    );
    alert(`Ticket ${ticket.id} reassigned!`);
  };

  const clearFilters = () => {
    setFilters({ highVis: [], statuses: [], dateRange: { start: '', end: '' } });
  };

  // ── Filtered + Paginated Tickets ──────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (activeTab === 'Rework') {
      result = result.filter(t => (t.reworkCount || 0) > 0);
    } else if (activeTab !== 'All') {
      result = result.filter(t =>
        t.status === activeTab ||
        t.status === STATUS_MAP_DISPLAY[activeTab]
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.taskName?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.operator?.toLowerCase().includes(q)
      );
    }

    if (filters.highVis.length > 0) {
      result = result.filter(t => filters.highVis.includes(t.visibility));
    }

    if (filters.statuses.length > 0) {
      result = result.filter(t => filters.statuses.includes(t.status));
    }

    return result;
  }, [tickets, activeTab, searchQuery, filters]);

  const hasActiveFilters =
    filters.highVis.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const totalPages      = Math.max(1, Math.ceil(filteredTickets.length / limit));
  const paginatedTickets = filteredTickets.slice((page - 1) * limit, page * limit);

  // ── Render ────────────────────────────────────────────────────────────────
return (
  // 1️⃣ ROOT — just a flex row, NO overflow hidden
  <div style={{
    display: 'flex',
    background: '#141414',
    minHeight: '100vh',
    minWidth: 'max-content', // ✅ KEY: allows horizontal scroll on small screens
    fontFamily: globalFont,
    color: '#fff',
    position: 'relative'
  }}>

    {/* ── Sidebar ── */}
    <div style={{
      flexShrink: 0,         // ✅ sidebar never shrinks
      position: 'sticky',
      top: 0,
      left: 0,
      height: '100vh',       // ✅ stays in view while page scrolls
      zIndex: 20
    }}>
      <QMSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        metrics={metrics}
        sidebarOpen={sidebarOpen}
      />
    </div>

    {/* 2️⃣ MAIN CONTENT — flex column, takes remaining width */}
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      // ✅ No overflow here — let html/body handle scroll
    }}>

      {/* ── Header ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 15,
        flexShrink: 0
      }}>
        <QMHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* 3️⃣ BODY — NO overflow, grows naturally */}
      <div style={{
        flex: 1,
        padding: '24px',
        boxSizing: 'border-box',
        width: '100%',
        // ✅ NO overflow — page itself scrolls
      }}>

        {activeTab === 'Agents' ? (
          <OrganicSocialAgentsView />
        ) : (
          <>
            {/* Metrics Bar */}
            <QMMetricsBar
              metrics={metrics}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />

            {/* Rework tab → per-ticket rework breakdown (which agents, how many rounds) */}
            {activeTab === 'Rework' && (
              <div style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '14px', padding: '16px 20px', marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#f87171',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  🔁 Rework by ticket — agents who worked each
                </div>
                {reworkTickets.length === 0 ? (
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>No rework yet.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {reworkTickets.map((t) => (
                      <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                        padding: '10px 14px', borderRadius: '10px',
                        background: '#222', border: '1px solid #333'
                      }}>
                        {/* Ticket name */}
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#e5e5e5', minWidth: '160px' }}>
                          {t.name}
                        </span>
                        {/* Total rounds */}
                        <span style={{
                          fontSize: '11px', fontWeight: '800', color: '#f87171',
                          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '999px', padding: '2px 9px', whiteSpace: 'nowrap'
                        }}>
                          🔁 {t.reworkCount} {t.reworkCount === 1 ? 'round' : 'rounds'}
                        </span>
                        {/* Per-agent chips */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {t.agents.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>—</span>
                          ) : t.agents.map(([name, rounds]) => (
                            <span key={name} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              fontSize: '12px', color: '#cbd0d8',
                              background: '#2a2a2a', border: '1px solid #3a3a3a',
                              borderRadius: '999px', padding: '3px 10px',
                            }}>
                              👤 {name}
                              <span style={{ fontWeight: '800', color: '#f87171' }}>×{rounds}</span>
                            </span>
                          ))}
                        </div>
                        {/* Time invested on this ticket (totals) */}
                        <span style={{
                          marginLeft: 'auto', fontSize: '12px', color: '#cbd0d8', whiteSpace: 'nowrap',
                          display: 'inline-flex', alignItems: 'center', gap: '10px'
                        }}>
                          <span>⏱ Agent <b style={{ color: '#60a5fa' }}>{fmtMins(t.agentMins)}</b></span>
                          <span>🔍 QA <b style={{ color: '#22c55e' }}>{fmtMins(t.qaMins)}</b></span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ticket Table Card */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '14px',
              border: '1px solid #2a2a2a',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              {/* Table Toolbar */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid #2a2a2a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <h2 style={{
                    margin: 0, fontSize: '15px', fontWeight: '700',
                    color: '#fff', fontFamily: globalFont
                  }}>
                    {activeTab === 'All' ? 'All Tickets' : activeTab}
                  </h2>
                  <span style={{ fontSize: '12px', color: loadError ? '#ef4444' : '#555' }}>
                    {loading
                      ? 'Loading…'
                      : loadError
                        ? loadError
                        : `${filteredTickets.length} of ${total} tickets`}
                  </span>
                </div>

                <div style={{
                  display: 'flex', gap: '10px',
                  alignItems: 'center', flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    style={{
                      padding: '9px 14px', borderRadius: '8px',
                      border: '1px solid #333', background: '#222',
                      color: '#fff', fontSize: '13px',
                      width: '200px', outline: 'none',
                      fontFamily: globalFont,
                      transition: 'border 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.border = '1px solid #e50914'}
                    onBlur={(e) => e.target.style.border = '1px solid #333'}
                  />
                  <button
                    onClick={() => setShowFilters(p => !p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid #333',
                      background: hasActiveFilters ? '#e50914' : '#222',
                      color: hasActiveFilters ? '#fff' : '#ccc',
                      fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s',
                      fontFamily: globalFont, whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (!hasActiveFilters) e.currentTarget.style.background = '#2a2a2a';
                    }}
                    onMouseLeave={(e) => {
                      if (!hasActiveFilters) e.currentTarget.style.background = '#222';
                    }}
                  >
                    ⚙️ Filters
                    {hasActiveFilters && (
                      <span style={{
                        background: 'rgba(255,255,255,0.25)',
                        borderRadius: '999px', padding: '1px 6px', fontSize: '11px'
                      }}>
                        {filters.highVis.length + filters.statuses.length +
                          (filters.dateRange.start ? 1 : 0) +
                          (filters.dateRange.end ? 1 : 0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {showFilters && (
                <QMFilters
                  filters={filters}
                  setFilters={setFilters}
                  onClear={clearFilters}
                />
              )}

              {/* Table — NO extra wrapper needed, table itself has minWidth */}
              {loading && tickets.length === 0 ? (
                <Loader />
              ) : (
              <QMTable
                tickets={paginatedTickets}
                activeTab={activeTab}
                operators={operators}
                onQmStatusChange={handleQmStatusChange}
                onUpdateField={handleUpdateField}
                onOpenAssign={openAssign}
                onStatusChange={handleStatusChange}
                onTaskTypeChange={handleTaskTypeChange}
                onAssign={handleAssign}
                onReopen={handleReopen}
                onQAFailReassign={handleQAFailReassign}
                onViewComment={(text) => setViewComment({ show: true, text })}
              />
              )}

              <QMPagination
                page={page}
                totalPages={totalPages}
                limit={limit}
                setPage={setPage}
                setLimit={(n) => { setLimit(n); setPage(1); }}
              />
            </div>
          </>
        )}
      </div>
    </div>

    {/* Modals */}
    {showCommentModal && (
      <CommentModal
        commentText={commentText}
        setCommentText={setCommentText}
        onConfirm={confirmStatus}
        onCancel={() => {
          setShowCommentModal(false);
          setCommentText('');
          setSelectedTicketId(null);
          setPendingStatusChange(null);
        }}
      />
    )}
    {viewComment.show && (
      <ViewCommentModal
        text={viewComment.text}
        onClose={() => setViewComment({ show: false, text: '' })}
      />
    )}

    {assignModal.show && (
      <AssignModal
        ticket={assignModal.ticket}
        agentName={operators.find(o => o._id === assignModal.agentId)?.name}
        onCancel={() => setAssignModal({ show: false, ticket: null, agentId: null })}
        onConfirm={async (note) => {
          const { ticket, agentId } = assignModal;
          setAssignModal({ show: false, ticket: null, agentId: null });
          await handleAssign(ticket, agentId, note);
        }}
      />
    )}
  </div>
);
}
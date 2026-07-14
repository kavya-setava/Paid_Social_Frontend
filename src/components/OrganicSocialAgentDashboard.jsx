import React, { useState, useMemo, useEffect } from 'react';
import AgentHeader      from './organicSocial/agent/AgentHeader';
import AgentMetricsBar  from './organicSocial/agent/AgentMetricsBar';
import AgentTable       from './organicSocial/agent/AgentTable';
import AgentPagination  from './organicSocial/agent/AgentPagination';
import { ViewCommentModal } from './organicSocial/agent/AgentModals';
import { globalFont } from './organicSocial/agent/AgentDashboardConstants';
import useApiCaller from '../utils/hooks/useApicaller';
import useTicketLive from '../utils/hooks/useTicketLive';
import { useAuth } from '../context/AuthContext.Provider';
import Loader from './Loader';
import { confirmDialog } from '../utils/confirm';

// Backend status → label the agent sees. An assigned ticket the agent
// hasn't started yet reads "Yet to Start".
const AGENT_API_STATUS_DISPLAY = {
  ASSIGNED:       'Yet to Start',
  IN_PROGRESS:    'In Progress',
  PENDING_QA:     'Pushed to QA',
  QA_IN_PROGRESS: 'QA In Progress',
  QA_PASSED:      'QA Passed',
  QA_FAILED:      'QA Failed',
  COMPLETED:      'Completed',
  ON_HOLD:        'On Hold',
  CANCELLED:      'Cancelled',
};

const secToMin = (s) => Math.round((s || 0) / 60);

// Trafficking-status dropdown reflects the real backend state, so picking
// "In Progress" (or clicking Start) keeps both controls in sync.
// Once the agent hands off to QA (PENDING_QA / QA_IN_PROGRESS) — and even on
// a QA fail (back for rework) — it stays "In Progress" from the agent's view.
// It only flips to "Completed" when QA passes / the ticket closes.
const AGENT_TRAFFICKING_FROM_API = {
  IN_PROGRESS:    'In Progress',
  ON_HOLD:        'On Hold',
  PENDING_QA:     'In Progress',
  QA_IN_PROGRESS: 'In Progress',
  QA_FAILED:      'In Progress',
  QA_PASSED:      'Completed',
  COMPLETED:      'Completed',
};

const normalizeAgentTicket = (t) => ({
  _id:              t._id,
  id:               t._id,
  apiStatus:        t.status,
  status:           AGENT_API_STATUS_DISPLAY[t.status] || t.status || '—',
  taskName:         t.marketingCampaign || '—',
  traffickingStatus:AGENT_TRAFFICKING_FROM_API[t.status] || '',
  operator:         t.current?.agent?.name || '',
  visibility:       t.highVisibility || 'No',
  platform:         t.platform  || '',
  placement:        t.placement || '',
  page:             t.page      || '',
  creatorTeam:      t.projectTeam || '',
  // Persisted editable status fields (shared across roles)
  socialiteStatus:  t.socialiteStatus || '',
  mondayStatus:     t.mondayStatus || '',
  postType:         t.postType || '',
  scheduledPlatform:t.scheduledPlatform || '',
  // Agent-entered details (persisted)
  noOfAssets:       t.noOfAssets ?? '',
  realtimePosting:  !!t.realtimePosting,
  asapPosting:      !!t.asapPosting,
  postReview:       t.postReview || '',
  plauditFlag:      !!t.plauditFlag,
  publishDateRaw:   t.publishDatePST,
  taskReceivedTime: t.timeline?.assignedToAgentAt || t.timeline?.createdAt || t.createdAt,
  socialiteLink:    t.socialiteLink || '',
  mondayStatusLink: t.mondayStatusLink || '',           // agent-entered, QM/QA view it
  agentMinutes:     secToMin(t.time?.agentActiveSeconds),
  qaMinutes:        secToMin(t.time?.qaActiveSeconds),
  agentActiveSeconds: t.time?.agentActiveSeconds || 0,  // banked hands-on time (breaks excluded)
  agentRunningSince:t.time?.agentRunningSince || null,  // live-timer anchor while IN_PROGRESS
  reworkCount:      t.reworkCount || 0,                 // >0 → QA sent it back for rework
  comments:         [],
  raw:              t,
});

export default function OrganicSocialAgentDashboard() {
  const { user }                      = useAuth();
  const { fetchData }                 = useApiCaller();
  const [tickets, setTickets]         = useState([]);
  const [qaList, setQaList]           = useState([]);   // QA users for handoff
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState('');
  const [activeTab, setActiveTab]     = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(10);
  const [viewComment, setViewComment] = useState({ show: false, text: '' });

  // ── Load the tickets assigned to THIS agent ────────────────────────────────
  const loadTickets = async () => {
    setLoading(true);
    setLoadError('');
    // Unified endpoint — always the freshest data from the DB for this role.
    const res = await fetchData('get', 'organicSocial/tickets/my/tickets');
    if (res?.success && Array.isArray(res.data)) {
      setTickets(res.data.map(normalizeAgentTicket));
    } else {
      setLoadError(res?.message || 'Failed to load tickets');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    // QA dropdown for handoff — same endpoint the QM uses, with ?role=QA.
    // Defensive: keep only users who actually hold the QA role (each user's
    // `role` array is returned), so the picker is strictly QA people.
    (async () => {
      const res = await fetchData('get', 'organicSocial/tickets/operators?role=QA');
      if (res?.success && Array.isArray(res.data)) {
        const onlyQa = res.data.filter(u =>
          !Array.isArray(u.role) ||
          u.role.some(r => (r?.name || '').toUpperCase() === 'QA')
        );
        setQaList(onlyQa);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live updates: refetch (and toast) when a ticket is assigned/returned to me.
  useTicketLive(user?.userId || user?.id || user?._id, loadTickets);

  // ── Lifecycle actions (each re-loads the list on success) ──────────────────
  const runAction = async (ticket, path, body) => {
    const res = await fetchData('patch', `organicSocial/tickets/${ticket._id}/${path}`, body || {});
    if (res?.success) {
      await loadTickets();
    } else {
      alert(res?.message || 'Action failed');
    }
  };

  const handleStart    = (ticket)         => runAction(ticket, 'agent-start');
  const handlePause    = (ticket, type)   => runAction(ticket, 'agent-pause', { type });
  const handleResume   = (ticket)         => runAction(ticket, 'agent-resume');
  const handleComplete = (ticket, qaId)   => {
    if (!qaId) { alert('Pick a QA to hand off to'); return; }
    runAction(ticket, 'agent-complete', { qaId });
  };

  // Persist an editable status field (Socialite/Monday/Scheduled/Post Type).
  // Confirms the change, optimistically shows it, saves, then toasts.
  const handleUpdateField = async (ticket, patch) => {
    const desc = Object.values(patch).map(v => (v === true ? 'Yes' : v === false ? 'No' : v)).join(', ');
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

  // Save the Monday status link the agent typed (persists → QM/QA can see it).
  const handleSaveMondayLink = async (ticket, link) => {
    const res = await fetchData('patch', `organicSocial/tickets/${ticket._id}/monday-link`, { link });
    if (res?.success) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: '✅ Monday link saved' }));
      await loadTickets();
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: `❌ ${res?.message || 'Could not save'}` }));
    }
  };

  // ── Status Change ──────────────────────────────────────────────────────
  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, traffickingStatus: newStatus, status: newStatus }
          : t
      )
    );
  };

  // ── Tab Change ─────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery('');
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (activeTab !== 'All') {
      result = result.filter(t => t.traffickingStatus === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.taskName?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tickets, activeTab, searchQuery]);

  const totalPages       = Math.max(1, Math.ceil(filteredTickets.length / limit));
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * limit, page * limit
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: '#141414', minHeight: '100vh',
      minWidth: 'max-content',
      fontFamily: globalFont, color: '#fff'
    }}>

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, flexShrink: 0 }}>
        <AgentHeader />
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, padding: '24px', boxSizing: 'border-box' }}>

        {/* Metrics */}
        <AgentMetricsBar
          tickets={tickets}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        {/* Table Card */}
        <div style={{
          background: '#1a1a1a', borderRadius: '14px',
          border: '1px solid #2a2a2a', overflow: 'hidden'
        }}>

          {/* Toolbar */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #2a2a2a',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{
                margin: 0, fontSize: '15px', fontWeight: '700',
                color: '#fff', fontFamily: globalFont
              }}>
                {activeTab === 'All' ? 'My Tickets' : activeTab}
              </h2>
              <span style={{ fontSize: '12px', color: loadError ? '#ef4444' : '#555' }}>
                {loading
                  ? 'Loading…'
                  : loadError
                    ? loadError
                    : `${filteredTickets.length} tickets`}
              </span>
            </div>

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
                fontFamily: globalFont, transition: 'border 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
              onBlur={(e) => e.target.style.border = '1px solid #333'}
            />
          </div>

          {/* Table */}
          {loading && tickets.length === 0 ? (
            <Loader />
          ) : (
          <AgentTable
            tickets={paginatedTickets}
            activeTab={activeTab}
            qaList={qaList}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onSaveMondayLink={handleSaveMondayLink}
            onUpdateField={handleUpdateField}
            onStatusChange={handleStatusChange}
            onViewComment={(text) => setViewComment({ show: true, text })}
          />
          )}

          {/* Pagination */}
          <AgentPagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            setPage={setPage}
            setLimit={(n) => { setLimit(n); setPage(1); }}
          />
        </div>
      </div>

      {/* Modal */}
      {viewComment.show && (
        <ViewCommentModal
          text={viewComment.text}
          onClose={() => setViewComment({ show: false, text: '' })}
        />
      )}
    </div>
  );
}
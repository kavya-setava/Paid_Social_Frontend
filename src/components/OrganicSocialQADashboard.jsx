import React, { useState, useMemo, useEffect } from 'react';
import QAHeader     from './organicSocial/qa/QAHeader';
import QAMetricsBar from './organicSocial/qa/QAMetricsBar';
import QATable      from './organicSocial/qa/QATable';
import QAPagination from './organicSocial/qa/QAPagination';
import { ViewCommentModal, QACommentModal, QAFailModal } from './organicSocial/qa/QAModals';
import { globalFont } from './organicSocial/qa/QADashboardConstants';
import useApiCaller from '../utils/hooks/useApicaller';
import useTicketLive from '../utils/hooks/useTicketLive';
import { useAuth } from '../context/AuthContext.Provider';
import Loader from './Loader';

// Backend status → QA display label (matches QA_STATUS_STYLES keys).
const QA_API_STATUS_DISPLAY = {
  PENDING_QA:     'Pending Review',
  QA_IN_PROGRESS: 'QA In Progress',
  QA_PASSED:      'QA Passed',
  COMPLETED:      'QA Passed',
  QA_FAILED:      'QA Failed',
};

const secToMin = (s) => Math.round((s || 0) / 60);

const normalizeQaTicket = (t) => ({
  _id:              t._id,
  id:               t._id,
  apiStatus:        t.status,
  qaStatus:         QA_API_STATUS_DISPLAY[t.status] || t.status || 'Pending Review',
  taskName:         t.marketingCampaign || '—',
  taskType:         t.placement || 'NA',
  visibility:       t.highVisibility || 'No',
  assignedAgent:    t.current?.agent?.name || '',
  assignedQA:       t.current?.qa?.name || '',
  platform:         t.platform || '',
  placement:        t.placement || '',
  page:             t.page || '',
  creatorTeam:      t.projectTeam || '',
  // Persisted editable status fields (read-only for QA)
  socialiteStatus:  t.socialiteStatus || '',
  mondayStatus:     t.mondayStatus || '',
  traffickingStatus:t.traffickingStatus || '',
  scheduledPlatform:t.scheduledPlatform || '',
  postType:         t.postType || '',
  publishDateRaw:   t.publishDatePST,
  taskReceivedTime: t.timeline?.assignedToQaAt || t.timeline?.createdAt || t.createdAt,
  socialiteLink:    t.socialiteLink || '',
  mondayStatusLink: t.mondayStatusLink || '',   // agent-entered link (QA views)
  agentMinutes:     secToMin(t.time?.agentActiveSeconds),
  qaMinutes:        secToMin(t.time?.qaActiveSeconds),
  qaActiveSeconds:  t.time?.qaActiveSeconds || 0,   // banked QA time (accumulates across rounds)
  qaRunningSince:   t.time?.qaRunningSince || null,
  reworkCount:      t.reworkCount || 0,
  qaComment:        '',
  comments:         [],
  raw:              t,
});

export default function OrganicSocialQADashboard() {
  const { user }                        = useAuth();
  const { fetchData }                   = useApiCaller();
  const [tickets, setTickets]           = useState([]);
  const [agentList, setAgentList]       = useState([]);   // for FAIL → rework reassign
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState('');
  const [activeTab, setActiveTab]       = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [page, setPage]                 = useState(1);
  const [limit, setLimit]               = useState(10);
  const [isOnBreak, setIsOnBreak]       = useState(false);
  const [viewComment, setViewComment]   = useState({ show:false, text:'' });
  const [qaModal, setQaModal]           = useState({ show:false, ticket:null });
  const [failModal, setFailModal]       = useState({ show:false, ticket:null });

  // ── Load the QA's queue (re-run after every action) ────────────────────────
  const loadTickets = async () => {
    setLoading(true);
    setLoadError('');
    // Unified endpoint — always the freshest data from the DB for this role.
    const res = await fetchData('get', 'organicSocial/tickets/my/tickets');
    if (res?.success && Array.isArray(res.data)) {
      setTickets(res.data.map(normalizeQaTicket));
    } else {
      setLoadError(res?.message || 'Failed to load tickets');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTickets();
    // Agents for FAIL/rework reassignment (same endpoint, ?role=AGENT).
    (async () => {
      const res = await fetchData('get', 'organicSocial/tickets/operators?role=AGENT');
      if (res?.success && Array.isArray(res.data)) setAgentList(res.data);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live updates: refetch (and toast) when a ticket is handed to me for QA.
  useTicketLive(user?.userId || user?.id || user?._id, loadTickets);

  // ── Lifecycle actions ───────────────────────────────────────────────────────
  const handleQaStart = async (ticket) => {
    const res = await fetchData('patch', `organicSocial/tickets/${ticket._id}/qa-start`);
    if (res?.success) await loadTickets();
    else alert(res?.message || 'Could not start QA');
  };

  // payload: { result:'PASS' } | { result:'FAIL', agentId, feedback, errorTags }
  const handleQaComplete = async (ticket, payload) => {
    const res = await fetchData('patch', `organicSocial/tickets/${ticket._id}/qa-complete`, payload);
    if (res?.success) await loadTickets();
    else alert(res?.message || 'Could not finish QA');
  };

  // Local-only helpers (no dedicated backend endpoint yet).
  const handleSaveQAComment = (ticketId, comment) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, qaComment: comment } : t));
    setQaModal({ show:false, ticket:null });
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setPage(1); setSearchQuery(''); };

  // ── Filter ──────────────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (activeTab === 'Rework') {
      result = result.filter(t => (t.reworkCount || 0) > 0);
    } else if (activeTab !== 'All') {
      result = result.filter(t => t.qaStatus === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.taskName?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.assignedAgent?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tickets, activeTab, searchQuery]);

  const totalPages       = Math.max(1, Math.ceil(filteredTickets.length / limit));
  const paginatedTickets = filteredTickets.slice((page-1)*limit, page*limit);

  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#141414', minHeight:'100vh', minWidth:'max-content', fontFamily:globalFont, color:'#fff' }}>

      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:20, flexShrink:0 }}>
        <QAHeader onBreakChange={setIsOnBreak} />
      </div>

      {/* Body */}
      <div style={{ flex:1, padding:'24px', boxSizing:'border-box' }}>

        {/* Metrics */}
        <QAMetricsBar tickets={tickets} activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Table Card */}
        <div style={{ background:'#1a1a1a', borderRadius:'14px', border:'1px solid #2a2a2a', overflow:'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #2a2a2a', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
              <h2 style={{ margin:0, fontSize:'15px', fontWeight:'700', color:'#fff', fontFamily:globalFont }}>
                {activeTab === 'All' ? 'My QA Reviews' : activeTab}
              </h2>
              <span style={{ fontSize:'12px', color: loadError ? '#ef4444' : '#555' }}>
                {loading ? 'Loading…' : loadError ? loadError : `${filteredTickets.length} tickets`}
              </span>
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e)=>{ setSearchQuery(e.target.value); setPage(1); }}
              style={{ padding:'9px 14px', borderRadius:'8px', border:'1px solid #333', background:'#222', color:'#fff', fontSize:'13px', width:'200px', outline:'none', fontFamily:globalFont, transition:'border 0.2s', boxSizing:'border-box' }}
              onFocus={(e)=>e.target.style.border='1px solid #6366f1'}
              onBlur={(e)=>e.target.style.border='1px solid #333'}
            />
          </div>

          {/* Table */}
          {loading && tickets.length === 0 ? (
            <Loader />
          ) : (
          <QATable
            tickets={paginatedTickets}
            disabled={isOnBreak}
            onQaStart={handleQaStart}
            onQaComplete={handleQaComplete}
            onOpenFail={(ticket) => setFailModal({ show:true, ticket })}
            onViewComment={(text)=>setViewComment({show:true,text})}
            onOpenQAModal={(ticket) => setQaModal({ show:true, ticket })}
          />
          )}

          {/* Pagination */}
          <QAPagination
            page={page} totalPages={totalPages}
            limit={limit} setPage={setPage}
            setLimit={(n)=>{ setLimit(n); setPage(1); }}
          />
        </div>
      </div>

      {/* Modals */}
      {viewComment.show && (
        <ViewCommentModal
          text={viewComment.text}
          onClose={()=>setViewComment({show:false,text:''})}
        />
      )}

      {qaModal.show && (
        <QACommentModal
          ticket={qaModal.ticket}
          onSave={handleSaveQAComment}
          onClose={()=>setQaModal({show:false,ticket:null})}
        />
      )}

      {failModal.show && (
        <QAFailModal
          ticket={failModal.ticket}
          agentList={agentList}
          onClose={()=>setFailModal({show:false,ticket:null})}
          onSubmit={async ({ agentId, feedback }) => {
            await handleQaComplete(failModal.ticket, { result:'FAIL', agentId, feedback });
            setFailModal({ show:false, ticket:null });
          }}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import moment from 'moment';
import 'moment-timezone';

import useApiCaller from '../utils/hooks/useApicaller';
import AgentCards   from './AgentCards';
import AgentFilters from './AgentFilters';
import AgentTable   from './AgentTable';

// ── Constants ──────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api/tickets';

const globalFont =
  "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

const STATUS_MAP = {
  Assigned:          'Assigned',
  'On Hold':         'On_Hold',
  Completed:         'Completed',
  Reassigned:        'Reassigned',
  Reopened:          'Reopened',
  'Calendar Invite': 'Calender_Invite',
  Handoff:           'Handoff',
};

const WORKFLOW_API = {
  'On Hold':   'tickets/onHoldAssigment',
  Pause:       'tickets/pauseAssigment',
  Resume:      'tickets/resumeAssigment',
  Completed:   'tickets/completeAssignment',
  Handoff:     'tickets/handoff-to-qm',
  Assigned:    'tickets/assignTicket',
  Start:       'tickets/startCalenderInvite',
};

const cleanAndFormatDate = (dateString) => {
  if (!dateString) return { display: '—', timestamp: NaN };
  const cleanString = dateString
    .replace('@', '')
    .replace(/\(America\/Los_Angeles\)/, '')
    .trim();
  const dateObj = new Date(cleanString);
  if (isNaN(dateObj)) return { display: 'Invalid Date', timestamp: NaN };
  return {
    display: dateObj.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    dateOnly: dateObj.toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }),
    dateTime: dateObj.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }),
    timestamp: dateObj.getTime(),
  };
};

const pulseAnimation = `
  @keyframes offlinePulse {
    0%   { transform: scale(1);    opacity: 1;   }
    50%  { transform: scale(1.15); opacity: 0.7; }
    100% { transform: scale(1);    opacity: 1;   }
  }
`;

// ── Component ──────────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const { fetchData } = useApiCaller();
  const currentUser  = JSON.parse(localStorage.getItem('user'));
  const userId       = currentUser.id;

  // ── State ──────────────────────────────────────────────────────────────────
  const [tickets,      setTickets]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);
  const [statusCounts, setStatusCounts] = useState({});
  const [agents,       setAgents]       = useState([]);
  const [currentTime,  setCurrentTime]  = useState(Date.now());
  const [page,         setPage]         = useState(1);
  const [limit,        setLimit]        = useState(10);
  const [totalPages,   setTotalPages]   = useState(1);

  // Comment / status modals
  const [showCommentModal,   setShowCommentModal]   = useState(false);
  const [commentText,        setCommentText]        = useState('');
  const [pendingStatusChange,setPendingStatusChange] = useState(null);
  const [selectedTicketId,   setSelectedTicketId]   = useState(null);
  const [viewComment,        setViewComment]        = useState({ show: false, text: '' });

  // Filters
  const [filters, setFilters] = useState({
    highVis:   [],
    operators: [],
    statuses:  [],
    dateRange: { start: '', end: '' },
  });

  // Availability
  const savedAvailability  = localStorage.getItem('availabilityStatus');
  const initialAvailable   = savedAvailability === null ? true : savedAvailability === 'true';
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [isFrozen,    setIsFrozen]    = useState(!initialAvailable);

  const socketRef      = useRef(null);
  const fetchTicketsRef = useRef(null);

  // Netflix theme
  const colors = {
    bg: '#141414', surface: '#1a1a1a', border: '#404040',
    text: '#ffffff', textSecondary: '#e5e5e5', textMuted: '#757575',
    hoverBg: '#2a2a2a',
  };

  const hasActiveFilters =
    filters.highVis.length > 0 ||
    filters.operators.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  // ── Effects ────────────────────────────────────────────────────────────────

  // Tick every second for SLA countdown
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh every 8 s
  useEffect(() => {
    const id = setInterval(() => fetchTicketsRef.current?.(false), 8000);
    return () => clearInterval(id);
  }, []);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Socket
  useEffect(() => {
    socketRef.current = io('http://localhost:5000/api/');

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
      socketRef.current.emit('register', userId);
    });

    socketRef.current.on('assignment-event', (data) => {
      let title = '';
      let body  = '';
      if (data.type === 'NEW_ASSIGNMENT') { title = 'New Assignment'; body = `Ticket ${data.ticketId} assigned`; }
      if (data.type === 'CALENDER_INVITE') { title = 'Calendar Invite'; body = `Ticket ${data.ticketId} assigned for final recheck`; }
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/mediamintlogo.jpg' });
      }
      fetchTickets();
    });

    return () => socketRef.current.disconnect();
  }, [userId]);

  // Fetch availability on mount
  useEffect(() => {
    if (currentUser?.id) getUserAvailability();
  }, [currentUser?.id]);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetchData('get', 'users/activeAgents');
        if (res?.agents) setAgents(res.agents);
      } catch (err) { console.error('❌ Failed to fetch agents', err); }
    };
    fetchAgents();
  }, []);

  // Re-fetch whenever tab / search / page / limit / filters change
  useEffect(() => { fetchTickets(true); }, [activeTab, searchQuery, page, limit, filters]);

  // Reset page on tab / search / limit / filter change
  useEffect(() => { setPage(1); }, [activeTab, searchQuery, limit, filters]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getUserAvailability = async () => {
    try {
      const res    = await fetchData('get', `users/userAvailability?userId=${currentUser.id}`);
      const status = !res?.isOnBreak;
      setIsAvailable(status);
      setIsFrozen(res?.isOnBreak);
      localStorage.setItem('availabilityStatus', String(status));
    } catch (err) { console.error('Failed to fetch availability', err); }
  };

  const getStatusOptions = () => {
    if (activeTab === 'Calendar Invite') return ['Start', 'Completed'];
    return ['On Hold', 'Handoff', 'Completed', 'Pause', 'Resume'];
  };

  // ── fetchTickets ───────────────────────────────────────────────────────────
  const fetchTickets = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);

      let queryParams = `tickets?page=${page}&limit=${limit}`;

      if (activeTab !== 'All') {
        let backendStatus = activeTab === 'Completed' ? 'completed' : STATUS_MAP[activeTab];
        queryParams += `&status=${backendStatus}`;
      }

      if (searchQuery) queryParams += `&search=${searchQuery}`;

      const toUTC = (localDateTime) =>
        moment.tz(localDateTime, 'YYYY-MM-DD HH:mm', 'America/Los_Angeles').toISOString();

      if (filters.dateRange.start) queryParams += `&startDate=${toUTC(filters.dateRange.start)}`;
      if (filters.dateRange.end)   queryParams += `&endDate=${toUTC(filters.dateRange.end)}`;

      if (filters.highVis.length > 0) {
        const highVisibility = filters.highVis.map((v) => `"${v}"`).join(',');
        queryParams += `&highVisibility=${highVisibility}`;
      }

      const res = await fetchData('get', queryParams);
      if (!res) return;

      setStatusCounts(res.statusCounts || {});

      const REVERSE_STATUS_MAP = Object.fromEntries(
        Object.entries(STATUS_MAP).map(([key, val]) => [val, key])
      );

      const formatted = res.data?.map((row) => ({
        _id:              row._id,
        id:               row.ticketId,
        rowIndex:         row.rowIndex,
        taskName:         row.taskName,
        campaign:         row.marketingCampaign,
        socialiteLink:    row.socialiteLink,
        status:           REVERSE_STATUS_MAP[row.status] || row.status,
        operator:         row.operator || row.agentName || 'Unassigned',
        visibility:       row.highVisibility === 'Yes' || row.highVisibility === true ? 'Yes' : 'No',
        taskType:         row.taskType,
        comments:         row.comments || [],
        receivedFull:     row.taskReceivedTime,
        taskReceivedTime: cleanAndFormatDate(row.taskReceivedTime).display,
        publishDateRaw:   row.publishDatePST,
        assignmentId:     row.assignment?._id || null,
        currentAssignmentId: row.currentAssignment || null,
        agentId:          row.assignment?.agentId || null,
        slaEndDate:       row.assignment?.slaEndDate || null,
        assignmentStatus: row.assignment?.assignmentStatus || null,
        isCheckListCompleted: row.assignment?.isCheckListCompleted || false,
      }));

      setTickets(formatted);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  // Keep ref up-to-date
  fetchTicketsRef.current = fetchTickets;

  // ── Workflow ───────────────────────────────────────────────────────────────
  const handleWorkflowStatusChange = async (ticket, newStatus) => {
    try {
      if (newStatus === 'On Hold' || newStatus === 'Handoff') {
        const { value: message } = await Swal.fire({
          title: `${newStatus} - Add Message`,
          input: 'textarea',
          inputPlaceholder: 'Enter your message here...',
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#e50914',
          background: '#1a1a1a',
          color: '#e5e5e5',
          inputValidator: (value) => { if (!value) return 'Message is required!'; },
        });
        if (!message) return;
        await callWorkflowAPI(ticket, newStatus, message);
        return;
      }
      await callWorkflowAPI(ticket, newStatus, null);
    } catch (err) { console.error('Workflow error:', err); }
  };

  const callWorkflowAPI = async (ticket, newStatus, message) => {
    const endpoint = WORKFLOW_API[newStatus];
    if (!endpoint) return;

    const payload = {
      assignmentId: ticket?.assignmentId,
      agentId:      currentUser.id,
      ticketId:     ticket.id,
      userId:       currentUser.id,
    };

    if (newStatus === 'Completed') {
      if (activeTab === 'Assigned' || activeTab === 'Reassigned') {
        payload.status = 'QA_Pending';
      } else if (activeTab === 'Calendar Invite') {
        payload.status = 'CALENDER_INVITE';
      }
    }

    if (message) {
      if (newStatus === 'On Hold') payload.reason   = message;
      if (newStatus === 'Handoff') payload.message  = message;
    }

    try {
      const response = await fetchData('post', endpoint, payload);

      if (response?.error) {
        await Swal.fire({ icon: 'error', title: 'Action Failed', text: response.error, confirmButtonColor: '#e50914', background: '#1a1a1a', color: '#e5e5e5' });
        return;
      }
      if (response?.status === 'error' || response?.message?.includes('error')) {
        await Swal.fire({ icon: 'error', title: 'Action Failed', text: response.message || response.error, confirmButtonColor: '#e50914', background: '#1a1a1a', color: '#e5e5e5' });
        return;
      }

      fetchTickets(false);
      await Swal.fire({ icon: 'success', title: 'Success', text: `Ticket status updated to ${newStatus}`, timer: 1500, showConfirmButton: false, background: '#1a1a1a', color: '#e5e5e5' });
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Action Failed', text: err?.response?.data?.error || err?.message || 'An error occurred', confirmButtonColor: '#e50914', background: '#1a1a1a', color: '#e5e5e5' });
    }
  };

  // ── Availability ───────────────────────────────────────────────────────────
  const handleAvailabilityToggle = async () => {
    const newStatus = !isAvailable;
    try {
      setIsAvailable(newStatus);
      setIsFrozen(!newStatus);
      localStorage.setItem('availabilityStatus', String(newStatus));
      await fetchData('post', 'users/updateUserStatus', {
        userId: currentUser.id, availibityStatus: newStatus,
      });
      getUserAvailability();
      Swal.fire({ icon: 'success', title: newStatus ? 'You are Online' : 'You are Offline', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      setIsAvailable((prev) => !prev);
      setIsFrozen((prev) => !prev);
      localStorage.setItem('availabilityStatus', String(!newStatus));
      Swal.fire({ icon: 'error', title: 'Failed to update status' });
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const onLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, logout',
    });
    if (result.isConfirmed) {
      try {
        await fetchData('post', 'auth/logout');
        localStorage.clear();
        sessionStorage.clear();
        await Swal.fire({ icon: 'success', title: 'Logged out', timer: 1500, showConfirmButton: false });
        window.location.href = '/login';
      } catch { window.location.href = '/login'; }
    }
  };

  // ── Comment modal ──────────────────────────────────────────────────────────
  const handleStatusChange = (ticketId, newStatus) => {
    if (newStatus === 'Ready to Queue') {
      setSelectedTicketId(ticketId);
      setPendingStatusChange(newStatus);
      setShowCommentModal(true);
      setCommentText('');
    } else {
      updateTicketStatus(ticketId, newStatus, null);
    }
  };

  const confirmCommentAndStatus = () => {
    if (!commentText.trim()) { alert('Comment is mandatory'); return; }
    updateTicketStatus(selectedTicketId, pendingStatusChange, commentText);
    setShowCommentModal(false);
    setCommentText('');
  };

  // ── Ticket CRUD helpers (kept for completeness) ────────────────────────────
  const updateTicketAPI = async (payload) => {
    try {
      const res = await fetchData('put', 'tickets/update', payload);
      fetchTickets(activeTab);
      return res;
    } catch (err) { console.error('Update error:', err); }
  };

  const updateTicketStatus = async (ticketId, newStatus, providedComment = null) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;
    const payload = { ticketId: ticket.id, rowIndex: ticket.rowIndex, status: newStatus, taskType: ticket.taskType, comment: providedComment ?? ticket.comments };
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t));
    await updateTicketAPI(payload);
  };

  const clearAllFilters = () =>
    setFilters({ highVis: [], operators: [], statuses: [], dateRange: { start: '', end: '' } });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#141414', minHeight: '100vh', fontFamily: globalFont, color: colors.text }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 24px', background: '#1a1a1a', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/mediamintlogo.jpg" alt="MediaMint" style={{ height: '26px', borderRadius: '4px', objectFit: 'contain' }} />

            {/* Availability toggle */}
            <button
              onClick={handleAvailabilityToggle}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px', background: isAvailable ? '#16a34a' : '#dc2626', color: '#fff', transition: 'all 0.3s' }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
              {isAvailable ? 'Available' : 'Offline'}
            </button>
          </div>

          {/* User avatar */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e50914, #b91c1c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {currentUser?.name?.charAt(0)?.toUpperCase()}
              <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '2px solid #1a1a1a' }} />
            </div>

            {showUserMenu && (
              <div style={{ position: 'absolute', top: '50px', right: 0, background: '#1a1a1a', border: '1px solid #404040', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.6)', width: '240px', padding: '12px', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderBottom: '1px solid #404040' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e50914', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px' }}>
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: colors.text }}>{currentUser?.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>{currentUser?.role?.name}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ef4444', fontWeight: '500', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', marginTop: '6px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#7f1d1d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', pointerEvents: isFrozen ? 'none' : 'auto', opacity: isFrozen ? 0.5 : 1, filter: isFrozen ? 'grayscale(20%)' : 'none', transition: 'all 0.3s ease', userSelect: isFrozen ? 'none' : 'auto' }}>

        {/* ── CARDS ──────────────────────────────────────────────────────── */}
        <AgentCards
          statusCounts={statusCounts}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* ── TABLE SECTION ──────────────────────────────────────────────── */}
        <div style={{ pointerEvents: isFrozen ? 'none' : 'auto', opacity: isFrozen ? 0.45 : 1, filter: isFrozen ? 'grayscale(25%)' : 'none', transition: '0.3s ease' }}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid #404040', overflow: 'hidden' }}>

            {/* Table header bar */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #404040', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.text, fontFamily: globalFont }}>
                  {activeTab === 'All' ? 'All Tickets' : activeTab}
                </h2>
                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
                  Showing {tickets?.length || 0} {tickets?.length === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #404040', width: '200px', outline: 'none', background: '#2a2a2a', fontSize: '13px', fontFamily: globalFont, color: colors.text }}
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasActiveFilters ? '#e50914' : '#2a2a2a', border: '1px solid #404040', padding: '8px 14px', borderRadius: '8px', color: hasActiveFilters ? '#fff' : colors.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => !hasActiveFilters && (e.currentTarget.style.background = '#3a3a3a')}
                  onMouseLeave={(e) => !hasActiveFilters && (e.currentTarget.style.background = '#2a2a2a')}
                >
                  ⚙️ Filters{hasActiveFilters && ` (${filters.highVis.length + filters.operators.length + filters.statuses.length + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0)})`}
                </button>
              </div>
            </div>

            {/* ── FILTERS PANEL ────────────────────────────────────────── */}
            {showFilters && (
              <AgentFilters
                filters={filters}
                setFilters={setFilters}
                onClear={clearAllFilters}
              />
            )}

            {/* ── TICKETS TABLE ─────────────────────────────────────────── */}
            <AgentTable
              tickets={tickets}
              activeTab={activeTab}
              currentTime={currentTime}
              setViewComment={setViewComment}
              handleWorkflowStatusChange={handleWorkflowStatusChange}
              getStatusOptions={getStatusOptions}
            />
          </div>
        </div>
      </div>

      {/* ── OFFLINE OVERLAY ────────────────────────────────────────────────── */}
      {isFrozen && (
        <div style={{ position: 'fixed', top: '35%', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1a1a1a', padding: '40px 60px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '1px solid #404040', textAlign: 'center', minWidth: '430px' }}>
          <style>{pulseAnimation}</style>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'offlinePulse 1.5s infinite' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dc2626' }} />
          </div>
          <h3 style={{ margin: 0, color: '#dc2626', fontSize: '34px', fontWeight: '700' }}>You are Offline</h3>
          <p style={{ marginTop: '18px', color: '#757575', fontSize: '18px', lineHeight: '30px' }}>Dashboard interactions are disabled</p>
        </div>
      )}

      {/* ── COMMENT MODAL ──────────────────────────────────────────────────── */}
      {showCommentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '32px', width: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.7)', border: '1px solid #404040' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: colors.text }}>Status Update — Ready to Queue</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#757575' }}>Add a context note before marking as Ready to Queue.</p>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your context here..."
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #404040', minHeight: '120px', marginBottom: '24px', fontFamily: globalFont, fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#2a2a2a', color: colors.text }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowCommentModal(false)} style={{ padding: '10px 20px', background: '#2a2a2a', border: '1px solid #404040', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', color: colors.text }} onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a3a')} onMouseLeave={(e) => (e.currentTarget.style.background = '#2a2a2a')}>Cancel</button>
              <button onClick={confirmCommentAndStatus} style={{ padding: '10px 20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW COMMENT MODAL ─────────────────────────────────────────────── */}
      {viewComment.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '32px', width: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.7)', border: '1px solid #404040' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: colors.text }}>Ticket History & Notes</h2>
            <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #404040', minHeight: '150px', maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6' }}>
              {viewComment.text}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setViewComment({ show: false, text: '' })} style={{ padding: '10px 24px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '20px' }}>
        {/* Rows per page */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted }}>Rows per page</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e50914', background: '#2a2a2a', color: '#e50914', fontSize: '12px', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
          >
            {[10, 20, 30, 50, 100].map((size) => (
              <option key={size} value={size} style={{ background: '#1a1a1a', color: '#e5e5e5' }}>{size}</option>
            ))}
          </select>
        </div>

        {/* Page buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #404040', background: '#2a2a2a', color: '#e5e5e5', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>

          {(() => {
            const pages = [];
            if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
            else if (page <= 3)        pages.push(1, 2, 3, '...', totalPages);
            else if (page >= totalPages - 2) pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            else pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);

            return pages.map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === 'number' && setPage(p)}
                disabled={p === '...'}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #404040', background: page === p ? '#e50914' : '#2a2a2a', color: page === p ? '#fff' : '#e5e5e5', cursor: p === '...' ? 'default' : 'pointer' }}
              >
                {p}
              </button>
            ));
          })()}

          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #404040', background: '#2a2a2a', color: '#e5e5e5', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
        </div>
      </div>
    </div>
  );
}
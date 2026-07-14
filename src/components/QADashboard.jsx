import React, { useState, useEffect, useMemo } from 'react';
import useApiCaller from '../utils/hooks/useApicaller';
import Swal from "sweetalert2";
import Select from "react-select";
  import moment from "moment";
import "moment-timezone";
import { 
  FaTicketAlt, 
  FaInbox, 
  FaTimesCircle, 
  FaCheckCircle,
  FaUserCheck,
  FaCalendarAlt
} from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';

const API_URL = 'http://localhost:5000/api/';
import "../../src/components/style/qa.css"

// const API_URL = 'http://localhost:5000/api/tickets';
// const API_URL = 'https://netflix-backend-yt.onrender.com/api/tickets'

const STATUS_STYLES = {
  'In Progress': { bg: '#2a2a2a', color: '#e50914', darkBg: '#3a3a3a', darkColor: '#e50914' },
  'On Hold': { bg: '#2a2a2a', color: '#757575', darkBg: '#3a3a3a', darkColor: '#757575' },
  'Yet to Assign': { bg: '#2a2a2a', color: '#f5a623', darkBg: '#3a3a3a', darkColor: '#f5a623' },
  'Handoff': { bg: '#2a2a2a', color: '#4ade80', darkBg: '#3a3a3a', darkColor: '#4ade80' },
  'Completed': { bg: '#2a2a2a', color: '#22c55e', darkBg: '#3a3a3a', darkColor: '#22c55e' },
  'Cancelled': { bg: '#2a2a2a', color: '#ef4444', darkBg: '#3a3a3a', darkColor: '#ef4444' },
  'Assigned': { bg: '#2a2a2a', color: '#3b82f6', darkBg: '#3a3a3a', darkColor: '#3b82f6' },
  'Ready to Queue': { bg: '#2a2a2a', color: '#eab308', darkBg: '#3a3a3a', darkColor: '#eab308' },
  'Pushed to QA': { bg: '#2a2a2a', color: '#ec4899', darkBg: '#3a3a3a', darkColor: '#ec4899' }
};

const STATUS_OPTIONS = [
  'Start',
  'Completed',
  'Reassigned'
];

const TICKET_TYPES = [
  'AV Single Post',
  'AV Global Debut',
  'AV Studio',
  'Social Marketing Shorts',
  'Social Marketing Feed',
  'Social Marketing Community',
  'Marketing Production/Digital Production',
  'Games Non-Debut',
  'UCAN Paid Social',
  'Global Export Paid Social',
  'YTMH',
  'Music Rights',
  'YouTube Copy Raise',
  'Copy Review',
  'DCM access',
  'Thumbnail Creation',
  'Workday Reports',
  'Awards Marketing',
  'Backend Swap Debut',
  'Debut Scheduling',
  'SRT',
  'Others',
  'Updates',
  'Socialite Date Change',
  'Social Media Access',
  'Re-QC',
  'Internal Audit',
  'External Audit',
  'Channel Banner',
  'Games Debut',
  'LATAM Paid Social',
  'Games- Paid Social',
  'Music/Soundtracks',
  'Podcasts PR',
  'POP- PAL Access',
  'Metadata',
  'AD Hoc',
  'Games Global debut',
  'K- Shorts',
  'K- Feed',
  'K- Community',
  'Policy Updates',
  'Pubops',
  'France Short',
  'France Feed',
  'France Community',
  'QM Task',
  'EMEA Export Paid Social',
  'Paid Social Copy Raise',
  'Backend Swap Non-Debut',
  'Japan-Feed',
  'Japan-Short',
  'Japan-Community',
  'Anime-Feed',
  'Anime-Short',
  'Anime-Community',
  'Rejection',
  'Thumbnail Mock up',
  'Non-Debut Scheduling',
  'Integrated Marketing',
  'NON-K- Shorts',
  'NON-K- Feed',
  'NON-K- Community',
  'NON-France Short',
  'NON-France Feed',
  'NON-France Community',
  'NON-Anime-Feed',
  'NON-Anime-Short',
  'NON-Anime-Community',
  'NON-Japan-Feed',
  'NON-Japan-Short',
  'NON-Japan-Community',
  'NON-Social Marketing Shorts',
  'NON-Social Marketing Feed',
  'NON-Social Marketing Community',
  'NON-AV Single Post',
  'NON-AV Global Debut',
  'NON-AV Studio',
  'NON-Debut Scheduling',
  'NON-Update',
  'NON-Copy Raise',
  'NON-Copy Review',
  'NON-Thumbnail Creation'
];

const TEAM_AGENTS = ['Snehitha', 'Sarthak', 'Nishanth', 'Unassigned'];

const CommentCell = ({ comments, setViewComment, colors }) => {
  return (
    <div
      style={{
        cursor: 'pointer',
        color: '#e50914',
        fontSize: '12px',
        fontWeight: '600'
      }}
      onClick={() =>
        setViewComment({
          show: true,
          text: comments.map(c => c.message).join("\n\n")
        })
      }
    >
      View ({comments.length})
    </div>
  );
};

const cleanAndFormatDate = (dateString) => {
  if (!dateString) return { display: '—', timestamp: NaN };
  const cleanString = dateString.replace('@', '').replace(/\(America\/Los_Angeles\)/, '').trim();
  const dateObj = new Date(cleanString);
  if (isNaN(dateObj)) return { display: 'Invalid Date', timestamp: NaN };
  return {
    display: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    fullDisplay: dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    timestamp: dateObj.getTime()
  };
};

// Custom multi-select dropdown component
function FilterDropdown({ label, options, selected, onChange, darkMode, singleSelect = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // Netflix Theme Colors
  const netflixRed = '#E50914';
  const netflixDark = '#181818';
  const netflixCard = '#222222';
  const netflixBorder = '#333333';
  const netflixText = '#FFFFFF';
  const netflixMuted = '#B3B3B3';

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option));
    } else if (singleSelect) {
      // only one option can be selected at a time
      onChange([option]);
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '700',
          color: netflixMuted,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}
      >
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '10px',
          border: `1px solid ${isOpen ? netflixRed : netflixBorder}`,
          fontSize: '13px',
          fontWeight: '600',
          background: netflixCard,
          color: netflixText,
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.25s ease',
          boxShadow: isOpen
            ? `0 0 0 1px ${netflixRed}, 0 0 12px rgba(229,9,20,0.35)`
            : '0 2px 8px rgba(0,0,0,0.35)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2B2B2B';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = netflixCard;
        }}
      >
        <span>
          {selected.length === 0
            ? 'Select options'
            : `${selected.length} selected`}
        </span>

        <span
          style={{
            fontSize: '11px',
            color: netflixRed,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease'
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '105%',
            left: 0,
            right: 0,
            background: netflixDark,
            border: `1px solid ${netflixBorder}`,
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: 1000,
            maxHeight: '260px',
            overflowY: 'auto',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
          }}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  background: isSelected
                    ? 'rgba(229,9,20,0.15)'
                    : 'transparent',
                  color: isSelected ? netflixRed : netflixText,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  borderLeft: isSelected
                    ? `4px solid ${netflixRed}`
                    : '4px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected
                    ? 'rgba(229,9,20,0.15)'
                    : 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  readOnly
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: netflixRed,
                    cursor: 'pointer'
                  }}
                />

                {option}
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '11px',
            color: netflixRed,
            fontWeight: '700'
          }}
        >
          {selected.length} selected
        </p>
      )}
    </div>
  );
}

export default function QADashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const { fetchData } = useApiCaller()
  console.log(currentUser)
 
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [viewComment, setViewComment] = useState({ show: false, text: '' });
  const [isAvailable, setIsAvailable] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    highVis: [],
    operators: [],
    statuses: [],
    dateRange: { start: '', end: '' }
  });
  const [visibleCampaigns, setVisibleCampaigns] = useState({});
  const toggleCampaignVisibility = (id) => {
    setVisibleCampaigns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Dark mode state (Netflix theme fixed dark)
  const [darkMode, setDarkMode] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});
  const [qaUsers, setQaUsers] = useState([]);

  // Netflix theme colors (fixed dark theme)
  const colors = {
    bg: '#141414',
    surface: '#1a1a1a',
    border: '#404040',
    text: '#ffffff',
    textSecondary: '#e5e5e5',
    textMuted: '#757575',
    hoverBg: '#2a2a2a'
  };
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    fetchTickets(true);
    const interval = setInterval(() => {
      fetchTickets(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab, searchQuery, page, limit, filters]);
const qaStatusOptions = [
  { value: "PASSED", label: "✅ Approve" },
  { value: "FAILED", label: "❌ Reject" }
];
  useEffect(() => {
    const fetchQAUsers = async () => {
      try {
        const res = await fetchData("get", "users/by-role/3");
        if (res?.users) {
          setQaUsers(res.users);
        }
      } catch (err) {
        console.error("❌ Failed to fetch QA users", err);
      }
    };
    fetchQAUsers();
  }, []);

  const updateQA = async (ticketId, qaId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (!ticket.qaReviewId) {
      console.error("Missing qaReviewId");
      return;
    }
    try {
  const response  =  await fetchData("post", "tickets/startQAReview", {
        qaReviewId: ticket.qaReviewId,
        userId: qaId,
      });
      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId ? { ...t, qaId } : t
        )
      );
      if(response?.success)
      {
        fetchTickets()
      }
    } catch (err) {
      console.error("Start QA failed", err);
    }
  };

  const STATUS_MAP = {
    "Open": "Open",
    "Calendar Invite": "Calender_Invite",
    "Reassigned": "Reassigned",
    "Completed": "Completed"
  };


  const [totalPages, setTotalPages] = useState(1);

  const WORKFLOW_API = {
    "On Hold": "tickets/onHoldAssigment",
    "Pause": "tickets/pauseAssigment",
    "Resume": "tickets/resumeAssigment",
    "Completed": "tickets/completeAssignment",
    "Handoff": "tickets/handoff-to-qm",
    "Assigned": "tickets/assignTicket"
  };

  const handleWorkflowStatusChange = async (ticket, newStatus) => {
    try {
      if (newStatus === "On Hold" || newStatus === "Handoff") {
        const { value: message } = await Swal.fire({
          title: `${newStatus} - Add Message`,
          input: "textarea",
          inputPlaceholder: "Enter your message here...",
          inputAttributes: {
            "aria-label": "Type your message here"
          },
          showCancelButton: true,
          confirmButtonText: "Submit",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#e50914",
          background: "#1a1a1a",
          color: "#e5e5e5",
          inputValidator: (value) => {
            if (!value) {
              return "Message is required!";
            }
          }
        });
        if (!message) return;
        await callWorkflowAPI(ticket, newStatus, message);
        return;
      }
      await callWorkflowAPI(ticket, newStatus, null);
    } catch (err) {
      console.error("Workflow error:", err);
    }
  };

  const callWorkflowAPI = async (ticket, newStatus, message) => {
    const endpoint = WORKFLOW_API[newStatus];
    if (!endpoint) return;

    const payload = {
      assignmentId: ticket?.assignmentId,
      agentId: currentUser.id,
      ticketId: ticket.id,
      userId: currentUser.id,
    };

    if (message) {
      if (newStatus === "On Hold") {
        payload.reason = message;
      } else if (newStatus === "Handoff") {
        payload.message = message;
      }
    }

    await fetchData("post", endpoint, payload);
    fetchTickets(false);
  };

  const fetchTickets = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);

      let queryParams = `tickets?page=${page}&limit=${limit}`;

      if (activeTab !== "All") {
        let backendStatus;
        if (activeTab === "Open") {
          backendStatus = "QA_Pending";
        }
        else if (activeTab === "Completed") {
          backendStatus = "QA_Done"
        }
         else if (activeTab === "Reassigned") {
          backendStatus = "QA_FAILED"
        }
        else {
          backendStatus = STATUS_MAP[activeTab] || activeTab;
        }
        queryParams += `&status=${backendStatus}`;
      }

      if (searchQuery) {
        queryParams += `&search=${searchQuery}`;
      }

     const toUTC = (localDateTime) => {
      return moment
        .tz(localDateTime, "YYYY-MM-DD HH:mm", "America/Los_Angeles")
        .toISOString();
    };
    if (filters.dateRange.start) {
      queryParams += `&startDate=${toUTC(filters.dateRange.start)}`;
    }
    
    if (filters.dateRange.end) {
      queryParams += `&endDate=${toUTC(filters.dateRange.end)}`;
      ;
    }

      if (filters.highVis.length > 0) {
        const highVisibility = filters.highVis.map(v => `"${v}"`).join(",");
        queryParams += `&highVisibility=${highVisibility}`;
      }

      const res = await fetchData("get", queryParams);
      if (!res) return;

      setStatusCounts(res.statusCounts || {});

      const REVERSE_STATUS_MAP = Object.fromEntries(
        Object.entries(STATUS_MAP).map(([key, val]) => [val, key])
      );

      const formatted = res.data?.map((row) => ({
        _id: row._id,
        id: row.ticketId,
        rowIndex: row.rowIndex,
        taskName: row.taskName,
        campaign: row.marketingCampaign,
        socialiteLink: row.socialiteLink,
        status: REVERSE_STATUS_MAP[row.status] || row.status,
        operator: row.operator || row.agentName || "Unassigned",
        visibility: row.highVisibility === "Yes" || row.highVisibility === true ? "Yes" : "No",
        taskType: row.taskType,
        comments: row.comments || [],
        receivedFull: row.taskReceivedTime,
        taskReceivedTime: cleanAndFormatDate(row.taskReceivedTime).display,
        publishDateRaw: row.publishDatePST,
        assignmentId: row.assignment?._id || null,
        currentAssignmentId: row.currentAssignment || null,
        agentId: row.assignment?.agentId || null,
        qaReviewId: row.qaReviewId || null,
          qaChecklistId: row.qaChecklistId || null,
        qaReviewerName: row.qaReviewerName || row.qaReviewer?.name || "—",
        qaStatus:row.qaStatus || null,
        qaName:row.qaName || null,
        qaId:row.qaId || null
      }));

      setTickets(formatted);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  // const handleQAStatusChange = async (ticket, status) => {
  //   try {
  //     let message = "";
  //     if (status === "FAILED") {
  //       const res = await Swal.fire({
  //         title: "Reason for Failure",
  //         input: "textarea",
  //         inputPlaceholder: "Enter reason...",
  //         showCancelButton: true,
  //         background: "#1a1a1a",
  //         color: "#e5e5e5"
  //       });
  //       if (!res.value) return;
  //       message = res.value;
  //     }

  //     const latestTicket = tickets.find(t => t.id === ticket.id);
  //     const selectedAgentId = latestTicket?.operator;

  //     await fetchData("post", "tickets/updateQAReviewStatus", {
  //       qaReviewId: ticket.qaReviewId,
  //       userId: currentUser.id,
  //       agentId: selectedAgentId,
  //       QAReviewStatus: status,
  //       message
  //     });

  //     fetchTickets(false);
  //   } catch (err) {
  //     console.error("QA status update failed", err);
  //   }
  // };

    // get latest ticket state
    const [openAgentOperator,setOpenAgentOperator] = useState('')
   
const handleQAStatusChange = async (ticket, status,qaId) => {
  try {
    let message = "";
    
    if (status === "FAILED") {
      const res = await Swal.fire({
        title: "Reason for Failure",
        input: "textarea",
        inputPlaceholder: "Enter reason...",
        showCancelButton: true,
        background: "#1a1a1a",
        color: "#e5e5e5"
      });
      
      if (!res.value) return;
      message = res.value;
    }

    // Get latest ticket state
    const latestTicket = tickets.find(t => t.id === ticket.id);
    const selectedAgentId = latestTicket?.operator;

    console.log("Passing Agent ID:", latestTicket);

    // Update QA status
    const res = await fetchData("post", "tickets/updateQAReviewStatus", {
      qaReviewId: ticket.qaReviewId,
      userId: qaId,
      agentId: openAgentOperator,
      QAReviewStatus: status,
      message
    });

    // Handle backend error
    if (res?.error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.error
      });
      return;
    }

    // Show success message
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "QA status updated successfully",
      timer: 1500,
      showConfirmButton: false
    });

    // Refresh tickets
    fetchTickets(false);

  } catch (err) {
    console.error("QA status update failed", err);
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.message || "Something went wrong"
    });
  }
};
const handleOnHold = (ticket) => {
  setSelectedTicket(ticket);
  setShowHoldModal(true);
};
const submitHold = async () => {
  await fetchData("post", "tickets/onHoldAssigment", {
    assignmentId: selectedTicket.assignmentId,
    reason: holdReason
  });

  fetchTickets(false);
};



const [agents, setAgents] = useState([]);



  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetchData("get", "users/activeAgents");
        if (res?.agents) {
          setAgents(res.agents);
        }
      } catch (err) {
        console.error("❌ Failed to fetch agents", err);
      }
    };
    fetchAgents();
  }, []);

  const onLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await fetchData("post", "auth/logout");
        localStorage.clear();
        sessionStorage.clear();
        await Swal.fire({
          icon: "success",
          title: "Logged out",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false
        });
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/login";
      }
    }
  };

  const updateTicketType = async (ticketId, newTaskType) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (ticket.taskType === newTaskType) return;

    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId ? { ...t, taskType: newTaskType } : t
      )
    );
  };

  const updateOperator = async (ticketId, newOperator) => {
    console.log("Selected Agent ID:", newOperator);
    setOpenAgentOperator(newOperator)
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId ? { ...t, operator: newOperator } : t
      )
    );
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'dateRange') {
      setFilters(prev => ({ ...prev, dateRange: value }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      highVis: [],
      operators: [],
      statuses: [],
      dateRange: { start: '', end: '' }
    });
  };

  useEffect(() => {
    fetchTickets(true);
  }, [activeTab, searchQuery, page, limit, filters]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, limit, filters]);

 const metrics = {
    total: (statusCounts.qaPending || 0) + (statusCounts.QA_Failed || 0) + (statusCounts.completed || 0) +(statusCounts.calenderinvite || 0),
    open: statusCounts.qaPending || 0,
    calenderinvite: statusCounts.calenderinvite || 0,
    reassigned: statusCounts.QA_Failed || 0,
    completed: statusCounts.completed || 0
  };

  // Netflix Red Color
  const NETFLIX_RED = '#E50914';
  const NETFLIX_RED_DARK = '#B20710';

  // Metrics configuration with Netflix red icons.
  // `tab` maps each card to the table view it opens when clicked.
  const metricsConfig = [
    { label: 'Total Tickets', value: metrics.total, icon: FaTicketAlt, tab: 'All' },
    { label: 'Open', value: metrics.open, icon: FaInbox, tab: 'Open' },
    { label: 'Calendar Invite', value: metrics.calenderinvite, icon: FaCalendarAlt, tab: 'Calendar Invite' },
    { label: 'Rejected', value: metrics.reassigned, icon: FaTimesCircle, tab: 'Reassigned' },
    { label: 'Approved', value: metrics.completed, icon: FaCheckCircle, tab: 'Completed' }
  ];


  const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

  const hasActiveFilters = filters.highVis.length > 0 || filters.operators.length > 0 || filters.statuses.length > 0 || filters.dateRange.start || filters.dateRange.end;

  const thStyle = {
    padding: '16px 24px',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.textMuted
  };

  const getCommentsByType = (comments, type) => {
    if (!Array.isArray(comments)) return [];
    return comments.filter(c => c?.type?.toLowerCase() === type.toLowerCase());
  };

  return (
    <div style={{ background: '#141414', minHeight: '100vh', fontFamily: globalFont, color: colors.text }}>
      <div style={{ padding: '16px 24px', background: '#1a1a1a', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <img src="./netflixlogo.png" alt="Netflix" style={{ height: '32px', objectFit: 'contain' }} />
          <span style={{ color: '#404040', fontSize: '20px', fontWeight: '300' }}>|</span> */}

        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2a2a2a', border: '1px solid #404040', padding: '6px 12px', borderRadius: '6px', color: colors.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'} 
              onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button> */}
                      <img src="/mediamintlogo.jpg" alt="MediaMint" style={{ height: '26px', borderRadius: '4px', objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e50914, #b91c1c)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {currentUser?.name?.charAt(0)?.toUpperCase()}
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #1a1a1a'
                }}
              />
            </div>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  background: '#1a1a1a',
                  border: '1px solid #404040',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                  width: '240px',
                  padding: '12px',
                  zIndex: 100
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderBottom: '1px solid #404040'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#e50914',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: colors.text }}>
                      {currentUser?.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>
                      {currentUser?.role?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderRadius: '8px',
                    marginTop: '6px',
                    transition: 'all 0.2s'
                  }}
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

      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
         {metricsConfig.map((m, i) => {
            const IconComponent = m.icon;
            const isActive = activeTab === m.tab;
            return (
              <div
                key={i}
                onClick={() => setActiveTab(m.tab)}
                style={{
                  background: isActive ? 'rgba(229,9,20,0.12)' : '#1a1a1a',
                  padding: '14px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${isActive ? NETFLIX_RED : `${NETFLIX_RED}20`}`,
                  boxShadow: isActive
                    ? '0 4px 20px rgba(229,9,20,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.3s ease',
                  minWidth: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.border = `1px solid ${NETFLIX_RED}`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 20px rgba(229,9,20,0.2)`;
                }}
                onMouseLeave={(e) => {
                  if (isActive) return;
                  e.currentTarget.style.border = `1px solid ${NETFLIX_RED}20`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                }}
              >
                {/* Icon and Label on the same line at top */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    color: '#9CA3AF'
                  }}
                >
                  <IconComponent size={18} color={NETFLIX_RED} />
                  <p
                    style={{
                      fontSize: '11px',
                      margin: 0,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: globalFont,
                      color: 'white'
                    }}
                  >
                    {m.label}
                  </p>
                </div>

                {/* Count below */}
                <p
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color:'#ef4444',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    fontFamily: globalFont,
                    lineHeight: 1
                  }}
                >
                  {m.value}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid #404040', overflow: 'hidden', transition: 'all 0.3s' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #404040', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.text, fontFamily: globalFont }}>
                {activeTab === 'All' ? 'All Tickets' : activeTab}
              </h2>
              <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
                Showing {tickets?.length || 0} {(tickets?.length === 1) ? 'ticket' : 'tickets'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #404040', width: '200px', outline: 'none', background: '#2a2a2a', fontSize: '13px', fontFamily: globalFont, color: colors.text }} />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: hasActiveFilters ? '#e50914' : '#2a2a2a', border: '1px solid #404040', padding: '8px 14px', borderRadius: '8px', color: hasActiveFilters ? '#fff' : colors.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => !hasActiveFilters && (e.currentTarget.style.background = '#3a3a3a')} 
                onMouseLeave={(e) => !hasActiveFilters && (e.currentTarget.style.background = '#2a2a2a')}
              >
                ⚙️ Filters {hasActiveFilters && `(${filters.highVis.length + filters.operators.length + filters.statuses.length + (filters.dateRange.start ? 1 : 0) + (filters.dateRange.end ? 1 : 0)})`}
              </button>
            </div>
          </div>

          {showFilters && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #404040', background: '#1a1a1a', transition: 'all 0.3s' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '20px',
                  marginBottom: '16px',
                  alignItems: 'start'
                }}
              >
                <FilterDropdown 
                  label="High Visibility"
                  options={['Yes', 'No']}
                  selected={filters.highVis}
                  onChange={(val) => setFilters({ ...filters, highVis: val })}
                  darkMode={true}
                  singleSelect={true}
                />
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#757575', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Publish Date Range</label>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
                    <input 
                      type="datetime-local" 
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #404040', fontSize: '12px', fontFamily: globalFont, outline: 'none', background: '#2a2a2a', color: colors.text }}
                      placeholder="Start date"
                    />
                    <input 
                      type="datetime-local" 
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #404040', fontSize: '12px', fontFamily: globalFont, outline: 'none', background: '#2a2a2a', color: colors.text }}
                      placeholder="End date"
                    />
                  </div>
                  {(filters.dateRange.start || filters.dateRange.end) && <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#e50914', fontWeight: '600' }}>Date range active</p>}
                </div>
              </div>
              {hasActiveFilters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={clearAllFilters}
                    style={{ padding: '8px 16px', background: '#2a2a2a', border: '1px solid #404040', borderRadius: '6px', color: '#ef4444', fontWeight: '600', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1500px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #404040' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Received</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Publish Date (PST)</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Socialite Link</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Task Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Task Type</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>High Visibility</th>
                  <th style={{ padding: '16px 79px', fontSize: '12px', fontWeight: '600', color: 'white' }}>QA</th>
                  {(activeTab === "All" || activeTab === "Calendar Invite" || activeTab === "Open") && (
                    <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Status</th>
                  )}
                              {/* {( activeTab === "Calendar Invite" || activeTab === "Open") && 
                 ( <th style={thStyle}>Checklist</th>
                 )} */}

                 
                    <>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Agent</th>
                    </>
                 
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>QM Comments</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>QA Comments</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Agent Comments</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}></th> 
                </tr>
              </thead>
              <tbody>
                {tickets?.map(ticket => {
                  const qmComments = getCommentsByType(ticket.comments, "QM");
                  const qaComments = getCommentsByType(ticket.comments, "QA");
                  const agentComments = getCommentsByType(ticket.comments, "Agent");
                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #404040', transition: 'all 0.2s', background: '#1a1a1a' }}>
                      <td style={{ padding: '16px 24px', fontSize: '12px', color: colors.text, fontWeight: '500', whiteSpace: 'nowrap' }}>
                        {ticket.taskReceivedTime}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#e50914', whiteSpace: 'nowrap' }}>
                        {cleanAndFormatDate(ticket.publishDateRaw).fullDisplay}
                      </td>
                      <td
                        style={{
                          padding: '16px 24px',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        {ticket.socialiteLink ? (
                          <span
                            onClick={() => window.open(ticket.socialiteLink, "_blank", "noopener,noreferrer")}
                            style={{
                              color: colors.text,
                              cursor: 'pointer',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#e50914';
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = colors.text;
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            {"********"}
                          </span>
                        ) : (
                          <span style={{ color: colors.text }}>{"********"}</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '500', color: colors.textSecondary, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.taskName}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: `1px solid #404040`,
                            background: '#2a2a2a',
                            color: colors.text,
                            fontWeight: '600',
                            fontSize: '11px',
                            display: 'inline-block',
                            fontFamily: globalFont,
                            maxWidth: '150px'
                          }}
                        >
                          {ticket.taskType || 'Select Type'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: ticket.visibility === 'Yes' ? '#7f1d1d' : '#2a2a2a', color: ticket.visibility === 'Yes' ? '#ef4444' : '#757575' }}>{ticket.visibility}</span>
                      </td>
                   <td style={{ padding: '16px 24px' }}>
  {(activeTab === "Open" || activeTab === "Calendar Invite") ? (
    <Select
      options={qaUsers.map(user => ({ 
        value: user._id, 
        label: user.name 
      }))}
      value={
        ticket.qaId 
          ? qaUsers.find(u => u._id === ticket.qaId)
            ? { value: ticket.qaId, label: qaUsers.find(u => u._id === ticket.qaId).name }
            : null
          : null
      }
      onChange={(selected) => updateQA(ticket.id, selected?.value)}
      placeholder="Select QA..."
      isClearable={false}
      styles={{
        control: (base, state) => ({
          ...base,
          background: '#2a2a2a',
          borderColor: state.isFocused ? '#e50914' : '#404040',
          boxShadow: state.isFocused ? '0 0 0 1px #e50914' : 'none',
          minHeight: '34px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer'
        }),
        menu: (base) => ({
          ...base,
          background: '#1a1a1a',
          border: '1px solid #404040',
          borderRadius: '8px'
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          background: isSelected ? '#e50914' : isFocused ? '#2a2a2a' : '#1a1a1a',
          color: isSelected ? '#ffffff' : '#e5e5e5',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '10px 16px'
        }),
        singleValue: (base) => ({
          ...base,
          color: '#e5e5e5',
          fontWeight: '600'
        })
      }}
    />
  ) : (
    <span style={{ fontSize: '12px', fontWeight: '600', color: colors.text }}>
      {ticket.qaReviewerName || "—"}
    </span>
  )}
</td>
                      {(activeTab === "All" || activeTab === "Calendar Invite" || activeTab === "Open") && (
                        <td style={{ padding: '16px 24px' }}>
                          {activeTab === "All" ? (
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontWeight: '600',
                                fontSize: '12px',
                                background: '#2a2a2a',
                                color: '#e50914',
                              }}
                            >
                              {ticket.status}
                            </span>
                          ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
<div style={{ minWidth: '120px' }}>
  <Select
    options={qaStatusOptions}
    onChange={(selected) => handleQAStatusChange(ticket, selected?.value || "",ticket.qaId)}
    value={qaStatusOptions.find(option => option.value === ticket.qaStatus) || null}
    placeholder={ticket.qaStatus|| "Select"}
    isClearable={false}
    styles={{
      control: (base, state) => ({
        ...base,
        background: '#2a2a2a',
        borderColor: state.isFocused ? '#e50914' : '#404040',
        boxShadow: state.isFocused ? '0 0 0 1px #e50914' : 'none',
        '&:hover': {
          borderColor: '#e50914'
        },
        minHeight: '34px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer'
      }),
      menu: (base) => ({
        ...base,
        background: '#1a1a1a',
        border: '1px solid #404040',
        borderRadius: '8px',
        overflow: 'hidden'
      }),
      option: (base, { isFocused, isSelected }) => ({
        ...base,
        background: isSelected ? '#e50914' : isFocused ? '#2a2a2a' : '#1a1a1a',
        color: isSelected ? '#ffffff' : '#e5e5e5',
        cursor: 'pointer',
        fontSize: '12px',
        padding: '10px 16px',
        '&:active': {
          background: '#e50914'
        }
      }),
      singleValue: (base) => ({
        ...base,
        color: ticket.qaStatus === 'PASSED' ? '#4caf50' : ticket.qaStatus === 'FAILED' ? '#e50914' : '#e5e5e5',
        fontWeight: '600'
      }),
      placeholder: (base) => ({
        ...base,
        color: '#757575',
        fontSize: '12px'
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: '#757575',
        '&:hover': {
          color: '#e50914'
        }
      }),
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: '#404040'
      }),
      input: (base) => ({
        ...base,
        color: '#e5e5e5'
      })
    }}
    theme={(theme) => ({
      ...theme,
      colors: {
        ...theme.colors,
        primary: '#e50914',
        primary25: '#2a2a2a',
        primary50: '#3a3a3a',
        neutral0: '#1a1a1a',
        neutral5: '#2a2a2a',
        neutral10: '#3a3a3a',
        neutral20: '#404040',
        neutral30: '#555555',
        neutral40: '#757575',
        neutral50: '#999999',
        neutral60: '#b3b3b3',
        neutral70: '#cccccc',
        neutral80: '#e5e5e5',
        neutral90: '#ffffff',
      }
    })}
  />
</div>

                            </div>
                          )}
                        </td>
                      )}
                                            {/* {(activeTab === "Calendar Invite" || activeTab === "Open") && (
<td style={{ padding: '16px 24px' }}>
  <button
    onClick={() => {
      const url = `/qa-checklist/${ticket.qaReviewId}?checklistId=${ticket.qaChecklistId || ''}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }}
    style={{
      padding: '8px 16px',
      background: '#2a2a2a',
      border: '1px solid #e50914',
      borderRadius: '6px',
      color: '#e50914',
      fontWeight: '600',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#e50914';
      e.currentTarget.style.color = '#ffffff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#2a2a2a';
      e.currentTarget.style.color = '#e50914';
    }}
  >
    Checklist
  </button>
</td>)} */}
               
  <td style={{ padding: '16px 24px', minWidth: '220px' }}>
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      background: '#2a2a2a',
      color: '#ffffff',
      border: '1px solid #404040'
    }}>
      {ticket.operator || "Unassigned"}
    </span>
  </td>

                      <td style={{ padding: '16px 24px' }}>
                        {qmComments.length > 0 ? (
                          <CommentCell comments={qmComments} setViewComment={setViewComment} colors={colors} />
                        ) : (
                          <span style={{ color: '#757575' }}>NA</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {qaComments.length > 0 ? (
                          <CommentCell comments={qaComments} setViewComment={setViewComment} colors={colors} />
                        ) : (
                          <span style={{ color: '#757575' }}>NA</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {agentComments.length > 0 ? (
                          <CommentCell comments={agentComments} setViewComment={setViewComment} colors={colors} />
                        ) : (
                          <span style={{ color: '#757575' }}>NA</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {tickets?.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>No tickets match your filters</p>
            </div>
          )}
        </div>
      </div>

      {showCommentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '32px', width: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.7)', border: '1px solid #404040' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: colors.text }}>Status Update - Ready to Queue</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#757575' }}>Add a context note for this ticket before marking as Ready to Queue.</p>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Type your context here..." style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #404040', minHeight: '120px', marginBottom: '24px', fontFamily: globalFont, fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#2a2a2a', color: colors.text }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowCommentModal(false)} style={{ padding: '10px 20px', background: '#2a2a2a', border: '1px solid #404040', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', color: colors.text, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'} onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}>Cancel</button>
              <button onClick={confirmCommentAndStatus} style={{ padding: '10px 20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>Confirm Update</button>
            </div>
          </div>
        </div>
      )}

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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: colors.textMuted }}>Rows per page</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #e50914',
              background: '#2a2a2a',
              color: '#e50914',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none',
              accentColor: '#e50914'
            }}
          >
            {[10, 20, 30, 50, 100].map(size => (
              <option key={size} value={size} style={{ background: '#1a1a1a', color: '#e5e5e5' }}>{size}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #404040',
            background: '#2a2a2a',
            color: '#e5e5e5',
            cursor: page === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Prev
        </button>

        {(() => {
          const pages = [];
          if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
              pages.push(i);
            }
          } else {
            if (page <= 3) {
              pages.push(1, 2, 3, '...', totalPages);
            } else if (page >= totalPages - 2) {
              pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
              pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
          }
          return pages.map((p, i) => (
            <button
              key={i}
              onClick={() => typeof p === 'number' && setPage(p)}
              disabled={p === '...'}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #404040',
                background: page === p ? '#e50914' : '#2a2a2a',
                color: page === p ? '#fff' : '#e5e5e5',
                cursor: p === '...' ? 'default' : 'pointer'
              }}
            >
              {p}
            </button>
          ));
        })()}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #404040',
            background: '#2a2a2a',
            color: '#e5e5e5',
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
        </div>
      </div>
    </div>
  );
}
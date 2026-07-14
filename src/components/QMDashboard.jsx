import React, { useState, useEffect, useMemo,useRef } from 'react';
import useApiCaller from '../utils/hooks/useApicaller';
import Swal from "sweetalert2";
import Select from "react-select";
import socket from "../socket";
import { io } from "socket.io-client";
import moment from "moment";
import "moment-timezone";
import { 
  FaTicketAlt, 
  FaUserClock, 
  FaPlayCircle, 
  FaUserCheck, 
  FaCalendarAlt, 
  FaExchangeAlt,
  FaPauseCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaHandshake,
  FaCheckCircle,
  FaRedoAlt,
  FaChartLine
} from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';



// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";



 const API_URL = 'http://localhost:5000/api/tickets';
// const API_URL = 'https://netflix-backend-yt-1.onrender.com/api/tickets'

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
  'Yet to Assign',
  'Ready to Queue',
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
    fullDisplay: dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    dateOnly: dateObj.toLocaleString('en-GB', {
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
  const netflixBlack = '#141414';
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

export default function QMDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
const currentUser = JSON.parse(localStorage.getItem("user"));
const { fetchData } = useApiCaller()
 const [pendingUpdates, setPendingUpdates] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [viewComment, setViewComment] = useState({ show: false, text: '' });
console.log(currentUser,"ssssssssssssssssss")
  // Filter state
  const [filters, setFilters] = useState({
    highVis: [],
    operators: [],
    statuses: [],
    dateRange: { start: '', end: '' }
  });

  // Dark mode state (keep for compatibility, but Netflix theme is fixed dark)
  const [darkMode, setDarkMode] = useState(true);
const [statusCounts, setStatusCounts] = useState({});

const STATUS_MAP = {
  "Yet to Assign": "Yet_to_Assign",
  "Ready to Queue": "Ready_to_Queue",
  "Assigned": "Assigned",
  "On Hold": "On_Hold",
  "Completed": "Completed",
  "Pushed to QA": "QA_Pending",
  "QA Done": "QA_Done",
  "Reassigned": "Reassigned",
  "Reopened": "Reopened",
  "Calendar Invite": "Calender_Invite",
  "In Progress": "In_Progress",
   "Handoff": "Handoff"
  
};

const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [totalPages, setTotalPages] = useState(1);
// const [selectedAgent, setSelectedAgent] = useState("");
// const [selectedReopenAgent, setSelectedReopenAgent] = useState("");
// const [selectedTicket, setSelectedTicket] = useState(null);
// const [selectedQAFailAgent, setSelectedQAFailAgent] = useState(null);
  const refreshtoken = localStorage.getItem("refreshToken");
  const [selectedReopenAgent, setSelectedReopenAgent] = useState({});
const [selectedQAFailAgent, setSelectedQAFailAgent] = useState({});
const [selectedTicket, setSelectedTicket] = useState(null);
const [selectedAgent, setSelectedAgent] = useState(null);

// Common select styles to avoid duplication
const selectStyles = {
  container: (base) => ({
    ...base,
    width: '180px'
  }),
  control: (base, state) => ({
    ...base,
    minHeight: '34px',
    fontSize: '14px',
    backgroundColor: '#141414',
    borderColor: state.isFocused ? '#E50914' : '#333',
    boxShadow: state.isFocused ? '0 0 0 1px #E50914' : 'none',
    '&:hover': {
      borderColor: '#E50914'
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#181818',
    border: '1px solid #333',
    overflow: 'hidden'
  }),
  menuList: (base) => ({
    ...base,
    padding: 0
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500'
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected
      ? '#E50914'
      : state.isFocused
      ? '#B20710'
      : '#181818',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:active': {
      backgroundColor: '#E50914'
    }
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#999'
  }),
  input: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#fff'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#E50914' : '#999',
    '&:hover': {
      color: '#E50914'
    }
  }),
  indicatorSeparator: () => ({
    display: 'none'
  })
};

useEffect(() => {
  // initial fetch when tab / filters / search change
  fetchTickets(true);

  // start polling with the CURRENT filters, search, tab and page
  const interval = setInterval(() => {
    fetchTickets(false);
  }, 8000); // every 15 seconds

  // restart interval (and re-capture latest filters) whenever deps change
  return () => clearInterval(interval);

}, [activeTab, page, limit, filters, searchQuery]);




useEffect(() => {

  if (
    "Notification" in window &&
    Notification.permission !== "granted"
  ) {
    Notification.requestPermission();
  }

}, []);

// const user = JSON.parse(
//   localStorage.getItem("user")
// );

const user = JSON.parse(localStorage.getItem("user"));
const userId = user?.id;

const socketRef = useRef(null);

useEffect(() => {

  socketRef.current = io("http://localhost:5000/api/");

  socketRef.current.on("connect", () => {
    console.log("✅ Socket connected:", socketRef.current.id);

    // REGISTER USER (ONLY HERE)
    socketRef.current.emit("register", userId.toString());

    console.log("📤 REGISTER SENT:", userId);
  });

  socketRef.current.on("assignment-event", (data) => {
    console.log("SOCKET EVENT:", data);

    let title = "";
    let body = "";

    if (data.type === "ONHOLD") {
      title = "New Assignment";
      body = `Ticket ${data.ticketId} assigned`;
    }

    if (data.type === "QA_REASSIGN") {
      title = "QA Failed";
      body = `Ticket ${data.ticketId} reassigned`;
    }

    if (data.type === "CALENDER_INVITE") {
      title = "Calendar Invite";
      body = `Ticket ${data.ticketId} assigned for final recheck`;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/mediamintlogo.jpg",
      });
    }

    fetchTickets();
  });

  return () => {
    socketRef.current.disconnect();
  };

}, [userId]);
const fetchTickets = async (isInitialLoad = false) => {
  try {
    if (isInitialLoad) setLoading(true);
    let queryParams = `tickets?page=${page}&limit=${limit}`;
if (activeTab === "Reopened") {
  // Reopened card → send isReopened flag instead of status
  queryParams += `&isReopened=true`;
} else if (activeTab !== "All") {
  const backendStatus =
    activeTab === "Completed"
      ? "QA_Done"
      : activeTab === "QA Fail"
      ? "QA_Failed"
      : STATUS_MAP[activeTab];

  queryParams += `&status=${backendStatus}`;
}

    if (searchQuery?.trim()) {
      queryParams += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    // ✅ Start Date
    // if (filters.dateRange.start) {
    //   queryParams += `&startDate=${encodeURIComponent(
    //     filters.dateRange.start
    //   )}`;
    // }

    // // ✅ End Date
    // if (filters.dateRange.end) {
    //   queryParams += `&endDate=${encodeURIComponent(
    //     filters.dateRange.end
    //   )}`;
    // }


      // if (filters.dateRange.start) {
      //   queryParams += `&startDate=${filters.dateRange.start}`;
      // }

      // if (filters.dateRange.end) {
      //   queryParams += `&endDate=${filters.dateRange.end}`;
      // }

//iso

// if (filters.dateRange.start) {
//   queryParams += `&startDate=${new Date(
//     filters.dateRange.start
//   ).toISOString()}`;
// }

// if (filters.dateRange.end) {
//   queryParams += `&endDate=${new Date(
//     filters.dateRange.end
//   ).toISOString()}`;
// }

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
    // ✅ High Visibility
 if (filters.highVis.length > 0) {
  const highVisibility = filters.highVis
    .map(v => `"${v}"`)
    .join(",");
    console.log(highVisibility,"ggggggggggggggggg")

  queryParams += `&highVisibility=${highVisibility}`;

}

    if (filters.operators.length > 0) {
      queryParams += `&operator=${filters.operators.join(",")}`;
    }

    if (filters.statuses.length > 0) {
      const backendStatuses = filters.statuses.map(
        status => STATUS_MAP[status] || status
      );

      queryParams += `&filterStatuses=${backendStatuses.join(",")}`;
    }

    console.log("QUERY PARAMS:", queryParams);

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
      operatorId:row?.assignment?.agentId,
    visibility:
  row.highVisibility === "Yes" ||
  row.highVisibility === true
    ? "Yes"
    : "No",
      taskType: row.taskType,
      comments: row.comments || [],
      receivedFull: row.taskReceivedTime,
      taskReceivedTime: cleanAndFormatDate(
        row.taskReceivedTime
      ).display,
      publishDateRaw: row.publishDatePST,
    }));

    setTickets(formatted);

    setTotalPages(res.pagination?.totalPages || 1);

  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    if (isInitialLoad) setLoading(false);
  }
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

  const handleManualSync = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/sync`, { method: 'POST' });
      await fetchTickets(false);
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setLoading(false);
    }
  };

const updateTicketAPI = async (payload) => {
  
  try {
    const res = await fetchData("post", "tickets/Qm-ticket-update", payload);
    fetchTickets(activeTab)
    if (res?.status === "error") {
      console.error("Update failed:", res.message);
    }

    return res;
  } catch (err) {
    console.error("Update error:", err);
  }
};

const updateTicketStatus = (ticketId, newStatus, comment = "") => {
  setTickets(prev =>
    prev.map(t =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    )
  );

setPendingUpdates(prev => ({
  ...prev,
  [ticketId]: {
    ...prev[ticketId],
    status: newStatus,
    comment
  }
}));
};

const updateTicketType = async (ticketId, newTaskType) => {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  // optimistic UI update
  setTickets(prev =>
    prev.map(t =>
      t.id === ticketId ? { ...t, taskType: newTaskType } : t
    )
  );

  const payload = {
    ticketId: ticket._id,
    updateData: {
      taskType: newTaskType
    }
  };

  try {
    const res = await fetchData("put", "tickets/updateTicket", payload);

    if (res?.status === "error") {
      console.error("Task type update failed:", res.message);
    }

    fetchTickets(false);
  } catch (err) {
    console.error("Task type update error:", err);
  }
};

useEffect(() => {
  const updateTicket = async () => {
    for (const ticketId in pendingUpdates) {
      const update = pendingUpdates[ticketId];
// || update.taskType
      if (update.status) {
        const ticket = tickets.find(t => t.id === ticketId);

        if (!ticket) return;

        const payload = {
          ticketId: ticket._id,
          rowIndex: ticket.rowIndex,
          status: update.status,
          taskType: update.taskType,
          message: update.comment || "",
           userId:currentUser.id
        };

        await updateTicketAPI(payload);

        setPendingUpdates(prev => {
          const copy = { ...prev };
          delete copy[ticketId];
          return copy;
        });
      }
    }
  };

  updateTicket();
}, [pendingUpdates]);

const updateOperator = async (ticketId, newOperator) => {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;

  if (ticket.operator === newOperator) return;

  const payload = {
    ticketId: ticket.id,
    rowIndex: ticket.rowIndex,
    status: ticket.status,
    operator: newOperator,
    taskType: ticket.taskType,
    comment: ticket.comments,
  };

  setTickets(prev =>
    prev.map(t =>
      t.id === ticketId ? { ...t, operator: newOperator } : t
    )
  );

  await updateTicketAPI(payload);
};

// const handleAgentSelect = (ticketId, agentId) => {
//   setSelectedTicket(ticketId);
//   setSelectedAgent(agentId);
// };
// Update handleAgentSelect to set the global state
const handleAgentSelect = (ticketId, agentId) => {
  setSelectedTicket(ticketId);
  setSelectedAgent(agentId);
  
  // Also update the ticket's local state for display
  setTickets((prev) =>
    prev.map((ticket) =>
      ticket._id === ticketId
        ? { ...ticket, selectedAgent: agentId }
        : ticket
    )
  );
};
const handleAssign = async (operatorId,ticketId) => {
  // if (!selectedAgent || !selectedTicket) {
  //   Swal.fire("Warning", "Please select an agent", "warning");
  //   return;
  // }
  
  const payload = {
    ticketId: selectedTicket || ticketId ,
    action: "ON_HOLD",
    qaStatus: null,
    reason: "Manual assignment",
    assignedBy: currentUser?.id,
    agentId: selectedAgent || operatorId,
  };

  try {
    const res = await fetchData("post", "tickets/assignTicket", payload);

    if (res?.success) {
      Swal.fire("Success", res.message || "Assigned successfully", "success");
      fetchTickets();
      setSelectedAgent("");
      setSelectedTicket(null);
    } 
    else {
      Swal.fire("Error", res?.error );
    }

  } catch (err) {
    console.error(err);
    Swal.fire("Error", res?.error);
  }
};
// State for QA Fail

console.log(selectedQAFailAgent,"hello")

// Handler for updating operator for QA Fail
// Handler for updating operator for QA Fail
const updateOperatorForQAFail = async (ticketId, agentId, operatorId) => {
   const payload = {
     "ticketId": ticketId,
     "agentId": agentId || operatorId,
     "action": "QA_FAIL"
  };
  
  try {
    const res = await fetchData("post", "tickets/assignTicket", payload);
    
    // Check if the response was successful
    if (res.success) {
      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: res?.message || 'Assigned to Agent Successfully',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          fetchTickets(); // Refresh tickets only after user clicks OK
        }
      });
    } else {
      // Show error from response (like "Agent already has active tasks")
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: res.message || res.error || 'Failed to update operator for QA Fail',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      throw new Error(res.message || res.error || 'Failed to update operator for QA Fail');
    }
    
  } catch (error) {
    console.error("Error updating operator for QA Fail:", error);
    
    // Error alert for network or other errors
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.message || 'Failed to update operator for QA Fail. Please try again.',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
  }
};

// Handler for reassigning QA Fail ticket
const handleQAFailReassign = async (ticket) => {
  if (!selectedQAFailAgent) {
    alert("Please select an agent first");
    return;
  }
  
  try {
    await fetchData("post", `tickets/${ticket.id}/qa-fail-reassign`, {
      agentId: selectedQAFailAgent,
      ticketId: ticket._id
    });
    fetchTickets();
    setSelectedQAFailAgent(null);
    console.log("Ticket reassigned successfully for QA Fail");
  } catch (error) {
    console.error("Error reassigning QA Fail ticket:", error);
    alert("Failed to reassign ticket");
  }
};
const agentOptions = agents.map(agent => ({
  value: agent._id,
  label: agent.name
}));
const handleReopenTicket = async (ticket,operatorId) => {
  console.log("Reopen Agent ID:", selectedReopenAgent);
  
  // Get the agent specifically for this ticket
  const selectedAgentId = selectedReopenAgent[ticket._id];
  
  // Add validation here
  // if (!selectedAgentId) {
  //   Swal.fire({
  //     icon: "warning",
  //     title: "Agent Required",
  //     text: "Please select an agent before reopening the ticket",
  //     background: "#1a1a1a",
  //     color: "#fff",
  //     confirmButtonColor: "#e50914"
  //   });
  //   return;
  // }
  
  const { value: reason } = await Swal.fire({
    title: "Reopen Ticket",
    input: "textarea",
    inputLabel: "Reason",
    inputPlaceholder: "Enter reopen reason...",
    inputAttributes: {
      "aria-label": "Enter reopen reason"
    },
    showCancelButton: true,
    confirmButtonText: "Reopen",
    confirmButtonColor: "#e50914",
    cancelButtonText: "Cancel",
    background: "#1a1a1a",
    color: "#fff",
    inputValidator: (value) => {
      if (!value) {
        return "Reason is required!";
      }
    }
  });

  if (!reason) return;

  try {
    const payload = {
      ticketId: ticket._id,
      assignedBy: currentUser?.id,
      agentId: selectedAgentId || operatorId,  // Use the specific agent ID for this ticket
       action: "REOPEN", 
      
      reason
    };

    console.log("Reopen payload:", payload); // Debug log

    const res = await fetchData("post", "tickets/assignTicket", payload);
    
    if (res?.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: res?.message || "Ticket reopened successfully",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      fetchTickets();
      
      // Clear the selected agent for this ticket after successful reopen
      setSelectedReopenAgent(prev => ({
        ...prev,
        [ticket._id]: undefined
      }));
    } else {
      const errorMessage = res?.message || res?.error;
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        background: "#1a1a1a",
        color: "#fff",
        confirmButtonColor: "#e50914",
        confirmButtonText: "OK"
      });
    }
  } catch (err) {
    console.error(err);
    
      const errorMessage = res?.message || res?.error;
   
    
    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#e50914"
    });
  }
};
  const deleteTicket = async (ticketId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmDelete) return;

    try {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      await fetch(`${API_URL}/${ticketId}`, { method: 'DELETE' });
    } catch (err) { console.error('Delete error:', err); }
  };



const handleStatusChange = (ticketId, newStatus) => {

  if (newStatus === "Ready to Queue") {
    setSelectedTicketId(ticketId);
    setPendingStatusChange(newStatus);
    setCommentText("");
    setShowCommentModal(true);

    return;
  }

  updateTicketStatus(ticketId, newStatus);
};
const confirmCommentAndStatus = () => {

updateTicketStatus(
  selectedTicketId,
  pendingStatusChange,
  commentText
);

  setShowCommentModal(false);
  setCommentText('');
  setSelectedTicketId(null);
  setPendingStatusChange(null);
};
const handleCancelCommentModal = () => {
  setShowCommentModal(false);
  setCommentText('');
  setSelectedTicketId(null);
  setPendingStatusChange(null);
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
  setPage(1);
}, [activeTab, searchQuery, limit, filters]);


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

  const metrics = {
    total: statusCounts.total || 0,
    unassigned: statusCounts.unassigned || 0,
    assigned: statusCounts.assigned || 0,
    onHold: statusCounts.onHold || 0,
    completed: statusCounts.completed || 0,
    handoff: statusCounts.handoff || 0,
    readytoqueue: statusCounts.readytoqueue || 0,
    calenderinvite: statusCounts.calenderinvite || 0,
    reassigned: statusCounts.reassigned || 0,
    qapending: statusCounts.qapending || 0,
    qafailed: statusCounts.qafailed || 0,
    reopen: statusCounts.reopen || 0
  };

const NETFLIX_RED = '#E50914';
  const NETFLIX_RED_DARK = '#B20710';
  const NETFLIX_RED_LIGHT = '#ff1a2e';

  // Metrics configuration with Netflix red icons.
  // `tab` maps each card to the table view it opens when clicked.
  const metricsConfig = [
    { label: 'Total Tickets', value: metrics.total, icon: FaTicketAlt, tab: 'All' },
    { label: 'Yet to Assign', value: metrics.unassigned, icon: FaUserClock, tab: 'Yet to Assign' },
    { label: 'Ready to Queue', value: metrics.readytoqueue, icon: FaPlayCircle, tab: 'Ready to Queue' },
    { label: 'Assigned', value: metrics.assigned, icon: FaUserCheck, tab: 'Assigned' },
    { label: 'Calendar Invite', value: metrics.calenderinvite, icon: FaCalendarAlt, tab: 'Calendar Invite' },
    { label: 'Reassigned', value: metrics.reassigned, icon: FaExchangeAlt, tab: 'Reassigned' },
    { label: 'On Hold', value: metrics.onHold, icon: FaPauseCircle, tab: 'On Hold' },
    { label: 'QA Pending', value: metrics.qapending, icon: FaHourglassHalf, tab: 'Pushed to QA' },
    { label: 'QA Failed', value: metrics.qafailed, icon: FaTimesCircle, tab: 'QA Fail' },
    { label: 'Handoff', value: metrics.handoff, icon: FaHandshake, tab: 'Handoff' },
    { label: 'Completed', value: metrics.completed, icon: FaCheckCircle, tab: 'Completed' },
    { label: 'Reopen', value: metrics.reopen, icon: FaRedoAlt, tab: 'Reopened' }
  ];

  const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

  const hasActiveFilters = filters.highVis.length > 0 || filters.operators.length > 0 || filters.statuses.length > 0 || filters.dateRange.start || filters.dateRange.end;

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
const thStyle = {
  padding: '16px 24px',
  fontSize: '12px',
  fontWeight: '600',
  color: colors.textMuted
};
const getCommentsByType = (comments, type) => {
  if (!Array.isArray(comments)) return [];

  return comments.filter(
    c => c?.type?.toLowerCase() === type.toLowerCase()
  );
};


  return (
<div style={{ background: '#141414', minHeight: '100vh', fontFamily: globalFont, color: colors.text }}>
      <div style={{ padding: '16px 24px', background: '#1a1a1a', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <img src="./netflixlogo.png" alt="Netflix" style={{ height: '32px', objectFit: 'contain' }} /> */}
          {/* <span style={{ color: '#404040', fontSize: '20px', fontWeight: '300' }}>|</span> */}

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
  
  {/* Avatar Button */}
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

    {/* Online dot */}
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

  {/* Dropdown */}
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
      
      {/* User Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          borderBottom: '1px solid #404040'
        }}
      >
        {/* Avatar inside dropdown */}
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

      {/* Logout */}
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
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = '#7f1d1d')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = 'transparent')
        }
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
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
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
        padding: '16px 12px',
        borderRadius: '12px',
        border: `1px solid ${isActive ? NETFLIX_RED : `${NETFLIX_RED}20`}`,
        boxShadow: isActive
          ? '0 4px 20px rgba(229,9,20,0.25)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
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
      {/* Icon and Label together */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '10px'
        }}
      >
        <IconComponent size={16} color={NETFLIX_RED} />
        <span
          style={{
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'white',
            fontFamily: globalFont
          }}
        >
          {m.label}
        </span>
      </div>

      {/* Count below */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: '700',
          color: NETFLIX_RED,
          fontFamily: globalFont,
          lineHeight: 1
        }}
      >
        {m.value}
      </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '16px' }}>
                {/* High Visibility Dropdown */}
                <FilterDropdown
                  label="High Visibility"
                  options={['Yes', 'No']}
                  selected={filters.highVis}
                  onChange={(val) => setFilters({ ...filters, highVis: val })}
                  darkMode={true}
                  singleSelect={true}
                />

                {/* Operator Dropdown */}
<div>
  <label style={{ fontSize: '12px', fontWeight: '600', color: '#757575' }}>
    Operator
  </label>

<Select
  options={agentOptions}
  isMulti
  value={agentOptions.filter(opt =>
    filters.operators.includes(opt.value)
  )}
  onChange={(selected) =>
    setFilters({
      ...filters,
      operators: selected ? selected.map(s => s.value) : []
    })
  }
  placeholder="Search operators..."
  styles={{
    control: (base, state) => ({
      ...base,
      backgroundColor: '#141414',
      borderColor: state.isFocused ? '#E50914' : '#333',
      boxShadow: state.isFocused
        ? '0 0 0 1px #E50914'
        : 'none',
      minHeight: '44px',
      color: '#fff',
      transition: 'all 0.25s ease',
      '&:hover': {
        borderColor: '#E50914',
        boxShadow: '0 0 12px rgba(229, 9, 20, 0.4)'
      }
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: '#181818',
      border: '1px solid #333',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }),

    menuList: (base) => ({
      ...base,
      padding: '4px'
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#E50914'
        : state.isFocused
        ? '#B20710'
        : '#181818',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: state.isSelected ? '600' : '500',

      '&:hover': {
        backgroundColor: '#E50914',
        color: '#fff',
        paddingLeft: '18px'
      },

      '&:active': {
        backgroundColor: '#8C060E'
      }
    }),

    multiValue: (base) => ({
      ...base,
      background:
        'linear-gradient(135deg, #E50914, #B20710)',
      borderRadius: '6px',
      padding: '2px'
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: '#fff',
      fontWeight: 600,
      padding: '2px 6px'
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: '#fff',
      borderRadius: '4px',
      transition: 'all 0.2s ease',

      ':hover': {
        backgroundColor: '#fff',
        color: '#E50914'
      }
    }),

    input: (base) => ({
      ...base,
      color: '#fff'
    }),

    placeholder: (base) => ({
      ...base,
      color: '#999',
      fontWeight: 500
    }),

    singleValue: (base) => ({
      ...base,
      color: '#fff'
    }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#E50914' : '#999',
      transition: 'all 0.2s ease',

      '&:hover': {
        color: '#E50914',
        transform: 'scale(1.15)'
      }
    }),

    clearIndicator: (base) => ({
      ...base,
      color: '#999',

      '&:hover': {
        color: '#E50914'
      }
    }),

    indicatorSeparator: () => ({
      display: 'none'
    })
  }}
/>
</div>

                {/* Date Range Filter */}
          <div>
  <label
    style={{
      display: 'block',
      fontSize: '12px',
      fontWeight: '700',
      color: '#B3B3B3',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }}
  >
    Publish Date Range
  </label>

  <div
    style={{
      display: 'flex',
      gap: '10px',
      flexDirection: 'column'
    }}
  >
    <input
      type="datetime-local"
      value={filters.dateRange.start}
      onChange={(e) =>
        handleFilterChange('dateRange', {
          ...filters.dateRange,
          start: e.target.value
        })
      }
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #333333',
        fontSize: '13px',
        fontFamily: globalFont,
        outline: 'none',
        background: '#222222',
        color: '#FFFFFF',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        accentColor: '#E50914'
      }}
      placeholder="Start date"
      onFocus={(e) => {
        e.target.style.border = '1px solid #E50914';
        e.target.style.boxShadow =
          '0 0 0 1px #E50914, 0 0 12px rgba(229,9,20,0.35)';
      }}
      onBlur={(e) => {
        e.target.style.border = '1px solid #333333';
        e.target.style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.35)';
      }}
    />

    <input
      type="datetime-local"
      value={filters.dateRange.end}
      onChange={(e) =>
        handleFilterChange('dateRange', {
          ...filters.dateRange,
          end: e.target.value
        })
      }
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #333333',
        fontSize: '13px',
        fontFamily: globalFont,
        outline: 'none',
        background: '#222222',
        color: '#FFFFFF',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        accentColor: '#E50914'
      }}
      placeholder="End date"
      onFocus={(e) => {
        e.target.style.border = '1px solid #E50914';
        e.target.style.boxShadow =
          '0 0 0 1px #E50914, 0 0 12px rgba(229,9,20,0.35)';
      }}
      onBlur={(e) => {
        e.target.style.border = '1px solid #333333';
        e.target.style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.35)';
      }}
    />
  </div>

  {(filters.dateRange.start || filters.dateRange.end) && (
    <p
      style={{
        margin: '8px 0 0 0',
        fontSize: '11px',
        color: '#E50914',
        fontWeight: '700',
        letterSpacing: '0.03em'
      }}
    >
      Date range active
    </p>
  )}
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}>Operator</th>
{(activeTab === 'All' || activeTab === "Yet to Assign") && (
  <th
  style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'white' }}
  >
    Status
  </th>
)}
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
    return(
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #404040', transition: 'all 0.2s', background: '#1a1a1a' }}>
                    <td style={{ padding: '16px 24px', fontSize: '12px', color: colors.text, fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {ticket.taskReceivedTime}
                    </td>
                    
                    <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#e50914', whiteSpace: 'nowrap' }}>
                      {cleanAndFormatDate(ticket.publishDateRaw).dateOnly}
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
  {['Yet to Assign', 'Assigned', 'Completed'].includes(activeTab) ? (

    <select
      value={ticket.taskType || ""}
      onChange={(e) => updateTicketType(ticket.id, e.target.value)}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #404040',
        background: '#2a2a2a',
        color: colors.text,
        fontWeight: '600',
        fontSize: '11px',
        cursor: 'pointer',
        outline: 'none',
        fontFamily: globalFont,
        maxWidth: '150px'
      }}
    >
      <option value="">
        {ticket.taskType || 'NA'}
      </option>

      {TICKET_TYPES
        .filter(t => t !== ticket.taskType)
        .map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
    </select>

  ) : (

    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderRadius: '999px',
        background: ticket.taskType ? '#1e3a8a' : '#3f3f46',
        color: ticket.taskType ? '#93c5fd' : '#d4d4d8',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.02em',
        border: ticket.taskType ? '1px solid #2563eb' : '1px solid #52525b',
        maxWidth: '180px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
      title={ticket.taskType || 'NA'}
    >
      {ticket.taskType || 'NA'}
    </span>

  )}
</td>

                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', background: ticket.visibility === 'Yes' ? '#7f1d1d' : '#2a2a2a', color: ticket.visibility === 'Yes' ? '#ef4444' : '#757575' }}>{ticket.visibility}</span>
                    </td>

<td style={{ padding: '16px 24px' }}>

  {/* ON HOLD TAB */}
  {activeTab === 'On Hold' ? (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Select
        options={agentOptions}
        value={
          agentOptions.find(
            (opt) => opt.value === ticket.selectedAgent
          ) || null
        }
        onChange={(selected) =>
          handleAgentSelect(ticket._id, selected?.value)
        }
        placeholder={ticket.operator}
        styles={selectStyles}
      />
      <button
        onClick={()=>handleAssign(ticket.operatorId,ticket._id)}
       
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: 'none',
          background: '#059669',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
          opacity: (selectedTicket === ticket._id && selectedAgent) ? 1 : 0.5,
       
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (selectedTicket === ticket._id && selectedAgent) {
            e.currentTarget.style.background = '#047857';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTicket === ticket._id && selectedAgent) {
            e.currentTarget.style.background = '#059669';
          }
        }}
      >
        Assign
      </button>
    </div>

  ) : activeTab === 'Completed' ? (
    /* COMPLETED TAB - FIXED */
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Select
        options={agentOptions}
        value={
          agentOptions.find(
            opt => opt.value === selectedReopenAgent[ticket._id]
          ) || null
        }
        onChange={(selected) => {
          console.log("Selected Agent ID:", selected?.value);
          
          setSelectedReopenAgent(prev => ({
            ...prev,
            [ticket._id]: selected?.value
          }));
          
          updateOperator(ticket.id, selected?.value);
        }}
        placeholder={ticket.operator}
        styles={selectStyles}
      />
      <button
        onClick={() => handleReopenTicket(ticket,ticket.operatorId)}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: '#dc2626',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b91c1c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#dc2626';
        }}
      >
        Reopen
      </button>
    </div>

  ) : activeTab === 'QA Fail' ? (
    /* QA FAIL TAB - FIXED */
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <Select
    options={agentOptions}
    value={
      agentOptions.find(
        opt => opt.value === selectedQAFailAgent[ticket._id]
      ) || null
    }
    onChange={(selected) => {
      console.log("Selected QA Fail Agent ID:", selected?.value);
      
      setSelectedQAFailAgent(prev => ({
        ...prev,
        [ticket._id]: selected?.value
      }));
    }}
    placeholder={ticket.operator}
    styles={selectStyles}
  />
  <button
    onClick={() => updateOperatorForQAFail(ticket._id, selectedQAFailAgent[ticket._id],ticket.operatorId)}
    style={{
      padding: '6px 12px',
      borderRadius: '6px',
      border: 'none',
      background: '#f59e0b',
      color: '#fff',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#d97706';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#f59e0b';
    }}
  >
    Reassign
  </button>
</div>

  ) : (
    <span style={{ 
      fontSize: '12px', 
      fontWeight: '600', 
      color: colors.text 
    }}>
      {ticket.operator || '-'}
    </span>
  )}

</td>

      {(activeTab === 'All' || activeTab === "Yet to Assign") && (
  <td style={{ padding: '16px 24px' }}>
    
    {/* ALL TAB → SHOW TEXT */}
    {(activeTab === "All" || activeTab === "Ready to Queue") ? (
    <span
  style={{
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    minWidth: 'fit-content',

    background:
      ticket.status === "QA Done"
        ? '#14532d'
        : ticket.status === "Assigned"
        ? '#1e3a8a'
        : STATUS_STYLES[ticket.status]?.darkBg,

    color:
      ticket.status === "QA Done"
        ? '#86efac'
        : ticket.status === "Assigned"
        ? '#93c5fd'
        : STATUS_STYLES[ticket.status]?.darkColor,
  }}
>
  {ticket.status === "QA Done" ? "Completed" : ticket.status}
</span>
    ) : (
      
      /* OTHER TABS → DROPDOWN */
      <div style={{ position: 'relative', display: 'inline-block' }}>
  <div style={{ position: 'relative', display: 'inline-block' }}>
  <select
    value={ticket.status}
    onChange={e => handleStatusChange(ticket.id, e.target.value)}
    style={{
      appearance: 'none',
      padding: '6px 28px 6px 12px',
      borderRadius: '20px',
      border: 'none',
      background: STATUS_STYLES[ticket.status]?.darkBg,
      color: STATUS_STYLES[ticket.status]?.darkColor,
      fontWeight: '600',
      fontSize: '12px',
      cursor: 'pointer',
      outline: 'none',
      fontFamily: globalFont
    }}
  >
    <option value={ticket.status}>{ticket.status}</option>
    {STATUS_OPTIONS
      .filter(s => s !== ticket.status)
      .map(s => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
  </select>
  
  {/* Dropdown icon */}
  <svg
    style={{
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      width: '14px',
      height: '14px',
      color: STATUS_STYLES[ticket.status]?.darkColor || '#757575'
    }}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
</div>

        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: STATUS_STYLES[ticket.status]?.darkColor,
            fontSize: '10px'
          }}
        >
          
        </div>
      </div>
    )}
   </td>
)}
{/* QM Comments */}
<td style={{ padding: '16px 24px' }}>
  {qmComments.length > 0 ? (
    <CommentCell
      comments={qmComments}
      setViewComment={setViewComment}
      colors={colors}
    />
  ) : (
    <span style={{ color: '#757575' }}>NA</span>
  )}
</td>

{/* QA Comments */}
<td style={{ padding: '16px 24px' }}>
  {qaComments.length > 0 ? (
    <CommentCell
      comments={qaComments}
      setViewComment={setViewComment}
      colors={colors}
    />
  ) : (
    <span style={{ color: '#757575' }}>NA</span>
  )}
</td>

{/* Agent Comments */}
<td style={{ padding: '16px 24px' }}>
  {agentComments.length > 0 ? (
    <CommentCell
      comments={agentComments}
      setViewComment={setViewComment}
      colors={colors}
    />
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
              <button onClick={handleCancelCommentModal} style={{ padding: '10px 20px', background: '#2a2a2a', border: '1px solid #404040', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', color: colors.text, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'} onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}>Cancel</button>
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
          {/* Previous */}
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

          {/* Page Numbers */}
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

          {/* Next */}
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
// Analysis.jsx - Complete file with all components

import React, { useState, useEffect, useMemo, useRef } from 'react';
import useApiCaller from '../utils/hooks/useApicaller';
import Swal from "sweetalert2";
import Select from "react-select";
import socket from "../socket";
import { io } from "socket.io-client";
import moment from "moment";
import "moment-timezone";
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area 
} from 'recharts';

const API_URL = 'http://localhost:5000/api/tickets';

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

const STATUS_OPTIONS = ['Yet to Assign', 'Ready to Queue'];

const TICKET_TYPES = [
  'AV Single Post', 'AV Global Debut', 'AV Studio', 'Social Marketing Shorts',
  'Social Marketing Feed', 'Social Marketing Community', 'Marketing Production/Digital Production',
  'Games Non-Debut', 'UCAN Paid Social', 'Global Export Paid Social', 'YTMH', 'Music Rights',
  'YouTube Copy Raise', 'Copy Review', 'DCM access', 'Thumbnail Creation', 'Workday Reports',
  'Awards Marketing', 'Backend Swap Debut', 'Debut Scheduling', 'SRT', 'Others', 'Updates',
  'Socialite Date Change', 'Social Media Access', 'Re-QC', 'Internal Audit', 'External Audit',
  'Channel Banner', 'Games Debut', 'LATAM Paid Social', 'Games- Paid Social', 'Music/Soundtracks',
  'Podcasts PR', 'POP- PAL Access', 'Metadata', 'AD Hoc', 'Games Global debut', 'K- Shorts',
  'K- Feed', 'K- Community', 'Policy Updates', 'Pubops', 'France Short', 'France Feed',
  'France Community', 'QM Task', 'EMEA Export Paid Social', 'Paid Social Copy Raise',
  'Backend Swap Non-Debut', 'Japan-Feed', 'Japan-Short', 'Japan-Community', 'Anime-Feed',
  'Anime-Short', 'Anime-Community', 'Rejection', 'Thumbnail Mock up', 'Non-Debut Scheduling',
  'Integrated Marketing', 'NON-K- Shorts', 'NON-K- Feed', 'NON-K- Community', 'NON-France Short',
  'NON-France Feed', 'NON-France Community', 'NON-Anime-Feed', 'NON-Anime-Short', 'NON-Anime-Community',
  'NON-Japan-Feed', 'NON-Japan-Short', 'NON-Japan-Community', 'NON-Social Marketing Shorts',
  'NON-Social Marketing Feed', 'NON-Social Marketing Community', 'NON-AV Single Post',
  'NON-AV Global Debut', 'NON-AV Studio', 'NON-Debut Scheduling', 'NON-Update', 'NON-Copy Raise',
  'NON-Copy Review', 'NON-Thumbnail Creation'
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
      month: '2-digit', day: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    }),
    timestamp: dateObj.getTime()
  };
};

function FilterDropdown({ label, options, selected, onChange, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const netflixRed = '#E50914';
  const netflixCard = '#222222';
  const netflixBorder = '#333333';
  const netflixText = '#FFFFFF';
  const netflixMuted = '#B3B3B3';

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: netflixMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '10px',
          border: `1px solid ${isOpen ? netflixRed : netflixBorder}`, fontSize: '13px',
          fontWeight: '600', background: netflixCard, color: netflixText, cursor: 'pointer',
          textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'all 0.25s ease', boxShadow: isOpen ? `0 0 0 1px ${netflixRed}, 0 0 12px rgba(229,9,20,0.35)` : '0 2px 8px rgba(0,0,0,0.35)'
        }}
      >
        <span>{selected.length === 0 ? 'Select options' : `${selected.length} selected`}</span>
        <span style={{ fontSize: '11px', color: netflixRed, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>▼</span>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '105%', left: 0, right: 0, background: '#181818',
          border: `1px solid ${netflixBorder}`, borderRadius: '12px', overflow: 'hidden',
          zIndex: 1000, maxHeight: '260px', overflowY: 'auto', boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
        }}>
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                style={{
                  width: '100%', padding: '14px 16px', border: 'none',
                  background: isSelected ? 'rgba(229,9,20,0.15)' : 'transparent',
                  color: isSelected ? netflixRed : netflixText, textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s ease', fontSize: '13px', fontWeight: isSelected ? '700' : '500',
                  borderLeft: isSelected ? `4px solid ${netflixRed}` : '4px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}
              >
                <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ width: '16px', height: '16px', accentColor: netflixRed, cursor: 'pointer' }} />
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== AGENT PERFORMANCE COMPONENT ====================
// ==================== AGENT PERFORMANCE COMPONENT (CARDS FROM API) ====================
// ==================== AGENT PERFORMANCE COMPONENT (CARDS FROM API) ====================
const AgentPerformance = ({ assignmentStats, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 12;

  const agentStats = useMemo(() => {
    if (!assignmentStats || assignmentStats.length === 0) return {};
    
    const stats = {};
    assignmentStats.forEach(stat => {
      stats[stat.userName] = {
        assigned: stat.assigned || 0,
        completed: stat.completed || 0,
        inProgress: stat.inProgress || 0,
        onHold: stat.onHold || 0,
        totalAssignments: stat.totalAssignments || 0,
        completionRate: stat.totalAssignments > 0 
          ? ((stat.completed || 0) / stat.totalAssignments * 100).toFixed(1) 
          : 0,
        email: stat.userEmail || '',
        designation: stat.designation || ''
      };
    });
    return stats;
  }, [assignmentStats]);

  // Filter agents based on search term
  const filteredAgents = useMemo(() => {
    if (!searchTerm.trim()) return Object.entries(agentStats);
    
    return Object.entries(agentStats).filter(([agent, stats]) => 
      agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stats.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stats.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agentStats, searchTerm]);

  // Sort and paginate agents
  const paginatedAgents = useMemo(() => {
    const sorted = [...filteredAgents].sort((a, b) => b[1].totalAssignments - a[1].totalAssignments);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [filteredAgents, currentPage]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the component
    document.getElementById('agent-performance-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginTop: '24px', border: '1px solid #404040' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ color: '#e50914', fontSize: '14px' }}>Loading agent performance data...</div>
        </div>
      </div>
    );
  }

  if (Object.keys(agentStats).length === 0) {
    return (
      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginTop: '24px', border: '1px solid #404040' }}>
        <p style={{ textAlign: 'center', color: '#757575' }}>No agent performance data available</p>
      </div>
    );
  }

  return (
    <div id="agent-performance-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>👥 Agent Performance Dashboard</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #404040',
              background: '#0a0a0a',
              color: '#fff',
              fontSize: '13px',
              width: '250px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          <div style={{ fontSize: '12px', color: '#757575' }}>
            Showing {paginatedAgents.length} of {filteredAgents.length} agents
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {paginatedAgents.map(([agent, stats]) => (
          <div key={agent} style={{ 
            background: '#1a1a1a', 
            padding: '16px', 
            borderRadius: '12px', 
            border: '1px solid #404040',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <strong style={{ color: '#e50914', fontSize: '15px' }}>{agent}</strong>
                {stats.designation && (
                  <div style={{ fontSize: '11px', color: '#757575', marginTop: '2px' }}>{stats.designation}</div>
                )}
                {stats.email && (
                  <div style={{ fontSize: '10px', color: '#757575', marginTop: '2px' }}>{stats.email}</div>
                )}
              </div>
              <span style={{ 
                fontSize: '12px', 
                background: stats.completionRate >= 70 ? '#22c55e20' : stats.completionRate >= 40 ? '#f59e0b20' : '#ef444420',
                color: stats.completionRate >= 70 ? '#22c55e' : stats.completionRate >= 40 ? '#f59e0b' : '#ef4444',
                padding: '4px 10px', 
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                {stats.completionRate}% complete
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
              <span style={{ color: '#e5e5e5' }}>
                📋 Assigned: <strong style={{ color: '#3b82f6' }}>{stats.assigned}</strong>
              </span>
              <span style={{ color: '#e5e5e5' }}>
                ✅ Completed: <strong style={{ color: '#22c55e' }}>{stats.completed}</strong>
              </span>
              <span style={{ color: '#e5e5e5' }}>
                🔄 In Progress: <strong style={{ color: '#e50914' }}>{stats.inProgress}</strong>
              </span>
              <span style={{ color: '#e5e5e5' }}>
                ⏸️ On Hold: <strong style={{ color: '#6b7280' }}>{stats.onHold}</strong>
              </span>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#757575', marginBottom: '4px' }}>
                <span>Completion Progress</span>
                <span>{stats.completionRate}%</span>
              </div>
              <div style={{ height: '6px', background: '#2a2a2a', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${stats.completionRate}%`, 
                    height: '100%', 
                    background: stats.completionRate >= 70 ? '#22c55e' : stats.completionRate >= 40 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s' 
                  }} 
                />
              </div>
            </div>
            
            <div style={{ fontSize: '11px', color: '#757575', textAlign: 'right', borderTop: '1px solid #2a2a2a', paddingTop: '8px', marginTop: '4px' }}>
              Total workload: <strong style={{ color: '#e5e5e5' }}>{stats.totalAssignments}</strong> tickets
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          padding: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: currentPage === 1 ? '#2a2a2a' : '#e50914',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              opacity: currentPage === 1 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            ← Previous
          </button>
          
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '8px 14px',
                      background: currentPage === page ? '#e50914' : '#2a2a2a',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: currentPage === page ? '700' : '500',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {page}
                  </button>
                );
              }
              
              // Show ellipsis
              if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={page}
                    style={{
                      padding: '8px 6px',
                      color: '#757575',
                      fontSize: '13px'
                    }}
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              background: currentPage === totalPages ? '#2a2a2a' : '#e50914',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              opacity: currentPage === totalPages ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Next →
          </button>
        </div>
      )}
      
      {/* Page Info */}
      {totalPages > 1 && (
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#757575',
          marginTop: '8px'
        }}>
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};
// ==================== AGENT ASSIGNMENT STATS TABLE ====================
// const AgentAssignmentStats = ({ assignmentStats, loading }) => {
//   const [sortBy, setSortBy] = useState('totalAssignments');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [searchTerm, setSearchTerm] = useState('');

//   const sortedStats = useMemo(() => {
//     let filtered = (assignmentStats || []).filter(stat => 
//       stat.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stat.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       stat.designation?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
    
//     return filtered.sort((a, b) => {
//       let aVal = a[sortBy];
//       let bVal = b[sortBy];
//       if (typeof aVal === 'string') aVal = aVal.toLowerCase();
//       if (typeof bVal === 'string') bVal = bVal.toLowerCase();
//       if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
//       return aVal < bVal ? 1 : -1;
//     });
//   }, [assignmentStats, sortBy, sortOrder, searchTerm]);

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(field);
//       setSortOrder('desc');
//     }
//   };

//   const getStatusColor = (count, type) => {
//     if (type === 'assigned') return count > 10 ? '#ef4444' : count > 5 ? '#f59e0b' : '#3b82f6';
//     if (type === 'inProgress') return count > 8 ? '#ef4444' : count > 3 ? '#f59e0b' : '#10b981';
//     if (type === 'onHold') return count > 5 ? '#ef4444' : count > 2 ? '#f59e0b' : '#6b7280';
//     if (type === 'completed') return count > 20 ? '#22c55e' : count > 10 ? '#10b981' : '#059669';
//     return '#e5e5e5';
//   };

//   if (loading) {
//     return (
//       <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #404040' }}>
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
//           <div style={{ color: '#e50914', fontSize: '14px' }}>Loading assignment statistics...</div>
//         </div>
//       </div>
//     );
//   }

//   if (!assignmentStats || assignmentStats.length === 0) {
//     return (
//       <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #404040' }}>
//         <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#e50914' }}>📊 Agent Assignment Statistics</h3>
//         <div style={{ textAlign: 'center', padding: '40px', color: '#757575' }}>
//           No assignment data available
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #404040' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
//         <div>
//           <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0', color: '#e50914' }}>📊 Agent Assignment Statistics</h3>
//           <p style={{ fontSize: '13px', color: '#757575', margin: 0 }}>Track ticket assignments and workload by agent</p>
//         </div>
//         <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//           <input
//             type="text"
//             placeholder="Search agents..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               padding: '8px 16px',
//               borderRadius: '8px',
//               border: '1px solid #404040',
//               background: '#0a0a0a',
//               color: '#fff',
//               fontSize: '13px',
//               width: '200px'
//             }}
//           />
//           <div style={{ fontSize: '12px', color: '#757575' }}>
//             Total Agents: {assignmentStats.length}
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
//         <div style={{ background: '#0f0f0f', padding: '16px', borderRadius: '12px' }}>
//           <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Total Assignments</div>
//           <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e50914' }}>
//             {assignmentStats.reduce((sum, stat) => sum + (stat.totalAssignments || 0), 0)}
//           </div>
//         </div>
//         <div style={{ background: '#0f0f0f', padding: '16px', borderRadius: '12px' }}>
//           <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Avg per Agent</div>
//           <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
//             {(assignmentStats.reduce((sum, stat) => sum + (stat.totalAssignments || 0), 0) / assignmentStats.length).toFixed(1)}
//           </div>
//         </div>
//         <div style={{ background: '#0f0f0f', padding: '16px', borderRadius: '12px' }}>
//           <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Highest Load</div>
//           <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
//             {Math.max(...assignmentStats.map(s => s.totalAssignments || 0), 0)}
//           </div>
//         </div>
//         <div style={{ background: '#0f0f0f', padding: '16px', borderRadius: '12px' }}>
//           <div style={{ fontSize: '12px', color: '#757575', marginBottom: '8px' }}>Completion Rate</div>
//           <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>
//             {assignmentStats.length > 0 
//               ? ((assignmentStats.reduce((sum, stat) => sum + (stat.completed || 0), 0) / 
//                  assignmentStats.reduce((sum, stat) => sum + (stat.totalAssignments || 0), 0)) * 100 || 0).toFixed(1)
//               : 0}%
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div style={{ overflowX: 'auto' }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
//           <thead>
//             <tr style={{ borderBottom: '2px solid #404040' }}>
//               <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('userName')}>
//                 Agent {sortBy === 'userName' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('designation')}>
//                 Role {sortBy === 'designation' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('assigned')}>
//                 Assigned {sortBy === 'assigned' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('inProgress')}>
//                 In Progress {sortBy === 'inProgress' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('onHold')}>
//                 On Hold {sortBy === 'onHold' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('completed')}>
//                 Completed {sortBy === 'completed' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//               <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalAssignments')}>
//                 Total {sortBy === 'totalAssignments' && (sortOrder === 'asc' ? '↑' : '↓')}
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {sortedStats.map((stat, idx) => (
//               <tr key={stat.userId || idx} style={{ borderBottom: '1px solid #2a2a2a', transition: 'background 0.2s' }}>
//                 <td style={{ padding: '12px', fontWeight: '500' }}>
//                   <div>
//                     {stat.userName || 'Unknown'}
//                     <div style={{ fontSize: '11px', color: '#757575' }}>{stat.userEmail}</div>
//                   </div>
//                 </td>
//                 <td style={{ padding: '12px', color: '#e5e5e5' }}>{stat.designation || '—'}</td>
//                 <td style={{ padding: '12px', textAlign: 'center' }}>
//                   <span style={{ 
//                     background: getStatusColor(stat.assigned || 0, 'assigned'), 
//                     padding: '4px 10px', 
//                     borderRadius: '20px',
//                     color: '#fff',
//                     fontWeight: 'bold',
//                     fontSize: '12px'
//                   }}>
//                     {stat.assigned || 0}
//                   </span>
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center' }}>
//                   <span style={{ 
//                     background: getStatusColor(stat.inProgress || 0, 'inProgress'), 
//                     padding: '4px 10px', 
//                     borderRadius: '20px',
//                     color: '#fff',
//                     fontWeight: 'bold',
//                     fontSize: '12px'
//                   }}>
//                     {stat.inProgress || 0}
//                   </span>
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center' }}>
//                   <span style={{ 
//                     background: getStatusColor(stat.onHold || 0, 'onHold'), 
//                     padding: '4px 10px', 
//                     borderRadius: '20px',
//                     color: '#fff',
//                     fontWeight: 'bold',
//                     fontSize: '12px'
//                   }}>
//                     {stat.onHold || 0}
//                   </span>
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center' }}>
//                   <span style={{ 
//                     background: getStatusColor(stat.completed || 0, 'completed'), 
//                     padding: '4px 10px', 
//                     borderRadius: '20px',
//                     color: '#fff',
//                     fontWeight: 'bold',
//                     fontSize: '12px'
//                   }}>
//                     {stat.completed || 0}
//                   </span>
//                 </td>
//                 <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#e50914' }}>
//                   {stat.totalAssignments || 0}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// ==================== AGENT WORKLOAD CHART ====================
const AgentWorkloadChart = ({ assignmentStats }) => {
  const chartData = useMemo(() => {
    return (assignmentStats || []).slice(0, 10).map(stat => ({
      name: stat.userName?.split(' ')[0] || 'Unknown',
      assigned: stat.assigned || 0,
      inProgress: stat.inProgress || 0,
      onHold: stat.onHold || 0,
      completed: stat.completed || 0,
      total: stat.totalAssignments || 0
    }));
  }, [assignmentStats]);

  if (!chartData.length) return null;

  return (
    <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginTop: '24px', marginBottom: '24px', border: '1px solid #404040' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>📊 Agent Workload Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="name" stroke="#757575" />
          <YAxis stroke="#757575" />
          <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #404040', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="assigned" fill="#3b82f6" name="Assigned" />
          <Bar dataKey="inProgress" fill="#e50914" name="In Progress" />
          <Bar dataKey="onHold" fill="#6b7280" name="On Hold" />
          <Bar dataKey="completed" fill="#22c55e" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== PIE CHART COMPONENT ====================
const StatusPieChart = ({ statusCounts }) => {
  console.log(statusCounts, "sssssss");
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Map your API status keys to frontend display properties
  const statusConfig = {
    total: {
      displayName: "Total Tickets",
      color: "#e50914",
      icon: "📊",
      description: "Total number of tickets in the system",
    },
    unassigned: {
      displayName: "Unassigned",
      color: "#f5a623",
      icon: "⏳",
      description: "Tickets waiting for initial assignment",
    },
    assigned: {
      displayName: "Assigned",
      color: "#3b82f6",
      icon: "👤",
      description: "Tickets assigned to agents",
    },
    onHold: {
      displayName: "On Hold",
      color: "#757575",
      icon: "⏸️",
      description: "Tickets waiting on external factors",
    },
    completed: {
      displayName: "Completed",
      color: "#22c55e",
      icon: "✅",
      description: "Successfully completed tickets",
    },
    handoff: {
      displayName: "Handoff",
      color: "#ff6b6b",
      icon: "🤝",
      description: "Tickets transferred to another team/agent",
    },
    reassigned: {
      displayName: "Reassigned",
      color: "#8b5cf6",
      icon: "🔄",
      description: "Tickets that have been reassigned",
    },
  };

  // Get all the statuses to display
  const statusesToShow = [
    "total",
    "unassigned",
    "assigned",
    "onHold",
    "completed",
    "handoff",
    "reassigned",
  ];

  // Transform statusCounts from API into pie chart data
  const pieData = Object.entries(statusCounts || {})
    .filter(([key]) => statusesToShow.includes(key))
    .map(([statusKey, value]) => {
      const config = statusConfig[statusKey];
      if (!config) return null;
      return {
        name: config.displayName,
        value: value || 0,
        color: config.color,
        icon: config.icon,
        description: config.description,
        originalKey: statusKey,
      };
    })
    .filter((item) => item && item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Calculate total tickets (use the 'total' from API or sum all statuses)
  const totalTickets =
    statusCounts?.total || pieData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);
  const handleStatusClick = (data) =>
    setSelectedStatus(selectedStatus?.name === data.name ? null : data);

  if (totalTickets === 0 || !statusCounts || Object.keys(statusCounts).length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
          padding: "24px",
          borderRadius: "20px",
          border: "1px solid rgba(229,9,20,0.3)",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#757575" }}>No ticket data available</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid rgba(229,9,20,0.3)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(229,9,20,0.1) inset",
        marginBottom: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 4px 0",
              background: "linear-gradient(135deg, #fff 0%, #e50914 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            📊 Ticket Status Distribution
          </h2>
          <p style={{ fontSize: "13px", color: "#757575", margin: 0 }}>
            Visual breakdown of all tickets by current status
          </p>
        </div>

        {/* Total Tickets Card at Top Right */}
        <div
          style={{
            padding: "12px 24px",
            background: "#0a0a0a",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid #e50914",
            boxShadow: "0 0 10px rgba(229,9,20,0.2)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#757575",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Total Tickets
          </span>
          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: "4px 0 0 0",
              color: "#e50914",
            }}
          >
            {totalTickets}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={130}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handleStatusClick}
                paddingAngle={2}
                style={{ cursor: "pointer" }}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activeIndex === index ? "#fff" : "transparent"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    opacity={
                      selectedStatus && selectedStatus.name !== entry.name ? 0.6 : 1
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [`${value} tickets`, name]}
                labelFormatter={(name) => `${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, minWidth: "220px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#e50914",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Status Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pieData
              .filter((item) => item.name !== "Total Tickets")
              .map((item, idx) => {
                const percentage =
                  totalTickets > 0 ? ((item.value / totalTickets) * 100).toFixed(1) : "0";
                const isSelected = selectedStatus?.name === item.name;
                return (
                  <div
                    key={idx}
                    onClick={() => handleStatusClick(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      background: isSelected
                        ? `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(
                            item.color.slice(3, 5),
                            16
                          )}, ${parseInt(item.color.slice(5, 7), 16)}, 0.15)`
                        : "transparent",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: isSelected ? `1px solid ${item.color}` : "1px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: `${item.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#e5e5e5" }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: "12px", color: item.color, fontWeight: "bold" }}>
                          {percentage}%
                        </span>
                      </div>
                      <div style={{ marginBottom: "4px" }}>
                        <div
                          style={{
                            height: "6px",
                            background: "#2a2a2a",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background: item.color,
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11px", color: "#757575" }}>
                          {item.description}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {selectedStatus && selectedStatus.name !== "Total Tickets" && (
        <div
          style={{
            marginTop: "24px",
            padding: "16px 20px",
            background: "#0a0a0a",
            borderRadius: "12px",
            borderLeft: `4px solid ${selectedStatus.color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "32px" }}>{selectedStatus.icon}</span>
            <div>
              <h4 style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}>
                {selectedStatus.name}
              </h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#757575" }}>
                {selectedStatus.description}
              </p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <span
                style={{ fontSize: "28px", fontWeight: "bold", color: selectedStatus.color }}
              >
                {selectedStatus.value}
              </span>
              <span style={{ fontSize: "12px", color: "#757575", marginLeft: "4px" }}>
                tickets
              </span>
              <p style={{ margin: "0", fontSize: "11px", color: "#757575" }}>
                {totalTickets > 0
                  ? `${((selectedStatus.value / totalTickets) * 100).toFixed(1)}% of total`
                  : "0% of total"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==================== MAIN COMPONENT ====================
export default function Analysis() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const { fetchData } = useApiCaller()
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [viewComment, setViewComment] = useState({ show: false, text: '' });

  const [assignmentStats, setAssignmentStats] = useState([]);
  const [assignmentStatsLoading, setAssignmentStatsLoading] = useState(false);

  const [filters, setFilters] = useState({
    highVis: [],
    operators: [],
    statuses: [],
    dateRange: { start: '', end: '' }
  });


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
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedReopenAgent, setSelectedReopenAgent] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const refreshtoken = localStorage.getItem("refreshToken");

  const fetchAssignmentStats = async () => {
    setAssignmentStatsLoading(true);
    try {
      const response = await fetchData("get", "users/assignment-stats");
      if (response?.success && response?.data) {
        setAssignmentStats(response.data);
      } else {
        console.error("Failed to fetch assignment stats:", response);
        setAssignmentStats([]);
      }
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
      setAssignmentStats([]);
    } finally {
      setAssignmentStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);
    fetchAssignmentStats();
    
    const interval = setInterval(() => {
      fetchTickets(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000/api/");
    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      socketRef.current.emit("register", userId.toString());
    });
    socketRef.current.on("assignment-event", (data) => {
      let title = "", body = "";
      if (data.type === "ONHOLD") { title = "New Assignment"; body = `Ticket ${data.ticketId} assigned`; }
      if (data.type === "QA_REASSIGN") { title = "QA Failed"; body = `Ticket ${data.ticketId} reassigned`; }
      if (data.type === "CALENDER_INVITE") { title = "Calendar Invite"; body = `Ticket ${data.ticketId} assigned for final recheck`; }
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "/mediamintlogo.jpg" });
      }
      fetchTickets();
      fetchAssignmentStats();
    });
    return () => socketRef.current.disconnect();
  }, [userId]);
  const [statusCounts, setStatusCounts] = useState({});  // ✅ This is defined

  const fetchTickets = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) setLoading(true);
      let queryParams = `tickets?page=${page}&limit=10`;
      if (activeTab !== "All") {
        const backendStatus = activeTab === "Completed" ? "QA_Done" : STATUS_MAP[activeTab];
        queryParams += `&status=${backendStatus}`;
      }
      if (searchQuery?.trim()) {
        queryParams += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const toUTC = (localDateTime) => {
        return moment.tz(localDateTime, "YYYY-MM-DD HH:mm", "America/Los_Angeles").toISOString();
      };
      if (filters.dateRange.start) queryParams += `&startDate=${toUTC(filters.dateRange.start)}`;
      if (filters.dateRange.end) queryParams += `&endDate=${toUTC(filters.dateRange.end)}`;

      if (filters.highVis.length > 0) {
        const highVisibility = filters.highVis.map(v => `"${v}"`).join(",");
        queryParams += `&highVisibility=${highVisibility}`;
      }
      if (filters.operators.length > 0) queryParams += `&operator=${filters.operators.join(",")}`;
      if (filters.statuses.length > 0) {
        const backendStatuses = filters.statuses.map(status => STATUS_MAP[status] || status);
        queryParams += `&filterStatuses=${backendStatuses.join(",")}`;
      }

      const res = await fetchData("get", queryParams);
      if (!res) return;
// Current render's state value (old value)
console.log(statusCounts); // Logs: {} (or previous value)

const newStatusCounts = res?.statusCounts || {}; // New data from API
setStatusCounts(newStatusCounts); // Schedules update for NEXT render

console.log(newStatusCounts); // Logs: {total: 124, unassigned: 23, ...} (API data)
console.log(statusCounts); // Still logs: {} (current render's state, hasn't changed yet)

// The function ends here
// React will re-render the component with the new statusCounts value
// In the NEXT render, statusCounts will have the updated value
      const REVERSE_STATUS_MAP = Object.fromEntries(Object.entries(STATUS_MAP).map(([key, val]) => [val, key]));
      const formatted = res.data?.map((row) => ({
        _id: row._id, id: row.ticketId, rowIndex: row.rowIndex, taskName: row.taskName,
        campaign: row.marketingCampaign, socialiteLink: row.socialiteLink,
        status: REVERSE_STATUS_MAP[row.status] || row.status, operator: row.operator || row.agentName || "Unassigned",
        visibility: row.highVisibility === "Yes" || row.highVisibility === true ? "Yes" : "No",
        taskType: row.taskType, comments: row.comments || [], receivedFull: row.taskReceivedTime,
        taskReceivedTime: cleanAndFormatDate(row.taskReceivedTime).display, publishDateRaw: row.publishDatePST,
      }));
      setTickets(formatted);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };
  // Add this right after your useState
useEffect(() => {
  console.log("🔄 statusCounts CHANGED in NEW render:", statusCounts);
}, [statusCounts]);

// Also log during render
console.log("📊 Current render statusCounts:", statusCounts);

  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetchData("get", "users/activeAgents");
        if (res?.agents) setAgents(res.agents);
      } catch (err) {
        console.error("❌ Failed to fetch agents", err);
      }
    };
    fetchAgents();
  }, []);

  const updateTicketAPI = async (payload) => {
    try {
      const res = await fetchData("post", "tickets/Qm-ticket-update", payload);
      fetchTickets(activeTab);
      fetchAssignmentStats();
      return res;
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const updateTicketStatus = (ticketId, newStatus, comment = "") => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    setPendingUpdates(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], status: newStatus, comment } }));
  };

  const updateTicketType = async (ticketId, newTaskType) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, taskType: newTaskType } : t));
    setPendingUpdates(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], taskType: newTaskType } }));
  };

  useEffect(() => {
    const updateTicket = async () => {
      for (const ticketId in pendingUpdates) {
        const update = pendingUpdates[ticketId];
        if (update.status || update.taskType) {
          const ticket = tickets.find(t => t.id === ticketId);
          if (!ticket) return;
          const payload = { ticketId: ticket._id, rowIndex: ticket.rowIndex, status: update.status, taskType: update.taskType, message: update.comment || "", userId: currentUser.id };
          await updateTicketAPI(payload);
          setPendingUpdates(prev => { const copy = { ...prev }; delete copy[ticketId]; return copy; });
        }
      }
    };
    updateTicket();
  }, [pendingUpdates]);

  const updateOperator = async (ticketId, newOperator) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.operator === newOperator) return;
    const payload = { ticketId: ticket.id, rowIndex: ticket.rowIndex, status: ticket.status, operator: newOperator, taskType: ticket.taskType, comment: ticket.comments };
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, operator: newOperator } : t));
    await updateTicketAPI(payload);
    fetchAssignmentStats();
  };

  const handleAgentSelect = (ticketId, agentId) => {
    setSelectedTicket(ticketId);
    setSelectedAgent(agentId);
    setTickets((prev) => prev.map((ticket) => ticket._id === ticketId ? { ...ticket, selectedAgent: agentId } : ticket));
  };

  const handleAssign = async () => {
    if (!selectedAgent || !selectedTicket) {
      Swal.fire("Warning", "Please select an agent", "warning");
      return;
    }
    const payload = { ticketId: selectedTicket, action: "ON_HOLD", qaStatus: null, reason: "Manual assignment", assignedBy: currentUser?.id, agentId: selectedAgent };
    try {
      const res = await fetchData("post", "tickets/assignTicket", payload);
      if (res?.success) {
        Swal.fire("Success", res.message || "Assigned successfully", "success");
        fetchTickets();
        fetchAssignmentStats();
        setSelectedAgent("");
        setSelectedTicket(null);
      } else {
        Swal.fire("Error", res?.message || "Something went wrong", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.message || "Server error", "error");
    }
  };

  const agentOptions = agents.map(agent => ({ value: agent._id, label: agent.name }));

  const handleReopenTicket = async (ticket) => {
    if (!selectedReopenAgent) {
      Swal.fire({ icon: "warning", title: "Agent Required", text: "Please select an agent before reopening the ticket", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#e50914" });
      return;
    }
    const { value: reason } = await Swal.fire({
      title: "Reopen Ticket", input: "textarea", inputLabel: "Reason", inputPlaceholder: "Enter reopen reason...",
      showCancelButton: true, confirmButtonText: "Reopen", confirmButtonColor: "#e50914", cancelButtonText: "Cancel",
      background: "#1a1a1a", color: "#fff", inputValidator: (value) => { if (!value) return "Reason is required!"; }
    });
    if (!reason) return;
    try {
      const payload = { ticketId: ticket._id, assignedBy: currentUser?.id, agentId: selectedReopenAgent, action: "REOPEN", reason };
      const res = await fetchData("post", "tickets/assignTicket", payload);
      if (res?.success) {
        Swal.fire({ icon: "success", title: "Success", text: res?.message || "Ticket reopened successfully", timer: 2000, timerProgressBar: true, showConfirmButton: false });
        fetchTickets();
        fetchAssignmentStats();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res?.message || res?.error || "Failed to reopen ticket", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#e50914" });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || err?.message || "Something went wrong", background: "#1a1a1a", color: "#fff", confirmButtonColor: "#e50914" });
    }
  };

  const deleteTicket = async (ticketId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmDelete) return;
    try {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      await fetch(`${API_URL}/${ticketId}`, { method: 'DELETE' });
      fetchAssignmentStats();
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
    updateTicketStatus(selectedTicketId, pendingStatusChange, commentText);
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
    setFilters({ highVis: [], operators: [], statuses: [], dateRange: { start: '', end: '' } });
  };

  useEffect(() => {
    fetchTickets(true);
  }, [activeTab, searchQuery, page, filters]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, filters]);

  const onLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?", text: "You will be logged out of your account.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout", cancelButtonText: "Cancel"
    });
    if (result.isConfirmed) {
      try {
        await fetchData("post", "auth/logout");
        localStorage.clear();
        sessionStorage.clear();
        await Swal.fire({ icon: "success", title: "Logged out", text: "You have been successfully logged out.", timer: 1500, showConfirmButton: false });
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        window.location.href = "/login";
      }
    }
  };

  const metrics = {
    total: statusCounts.total || 0,
    yetToAssign: statusCounts.unassigned || 0,
    assigned: statusCounts.assigned || 0,
    onHold: statusCounts.onHold || 0,
    completed: statusCounts.completed || 0,
    handoff: statusCounts.handoff || 0,
    readyToQueue: statusCounts.readytoqueue || 0,
    inProgress: statusCounts.inProgress || 0
  };

  const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";
  const colors = { bg: '#141414', surface: '#1a1a1a', border: '#404040', text: '#ffffff', textSecondary: '#e5e5e5', textMuted: '#757575', hoverBg: '#2a2a2a' };

  return (
    <div style={{ background: '#141414', minHeight: '100vh', fontFamily: globalFont, color: colors.text }}>
      <div style={{ padding: '16px 24px', background: '#1a1a1a', borderBottom: '1px solid #333333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src="/mediamintlogo.jpg" alt="MediaMint" style={{ height: '26px', borderRadius: '4px', objectFit: 'contain' }} />
          {/* <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              padding: '8px 16px',
              background: showAnalytics ? '#e50914' : '#2a2a2a',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button> */}
          <div style={{ position: 'relative' }}>
            <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e50914, #b91c1c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}>
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
                <button onClick={onLogout} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', color: '#ef4444', fontWeight: '500', cursor: 'pointer', fontSize: '13px', borderRadius: '8px', marginTop: '6px', transition: 'all 0.2s' }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Agent Assignment Stats Table */}
        {/* <AgentAssignmentStats assignmentStats={assignmentStats} loading={assignmentStatsLoading} /> */}
        
        {/* Agent Workload Chart */}
        {/* {showAnalytics && assignmentStats.length > 0 && (
          <AgentWorkloadChart assignmentStats={assignmentStats} />
        )} */}

        {/* Status Pie Chart */}
   <StatusPieChart statusCounts={statusCounts} />

        {/* Analytics Section */}
    {/* Analytics Section */}
{showAnalytics && (
  <div style={{ marginBottom: '32px' }}>
    {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700' }}>📈 Analytics Dashboard</h2>
    </div> */}
    <AgentPerformance assignmentStats={assignmentStats} loading={assignmentStatsLoading} />
  </div>
)}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', border: '1px solid #404040' }}>
            <h3 style={{ marginTop: 0, color: '#e50914' }}>Add Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #404040',
                background: '#0a0a0a',
                color: '#fff',
                fontSize: '14px',
                marginBottom: '16px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelCommentModal}
                style={{
                  padding: '8px 16px',
                  background: '#2a2a2a',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  color: '#e5e5e5',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmCommentAndStatus}
                style={{
                  padding: '8px 16px',
                  background: '#e50914',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Comment Modal */}
      {viewComment.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', border: '1px solid #404040' }}>
            <h3 style={{ marginTop: 0, color: '#e50914' }}>Comments</h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '12px',
              background: '#0a0a0a',
              borderRadius: '8px',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {viewComment.text}
            </div>
            <button
              onClick={() => setViewComment({ show: false, text: '' })}
              style={{
                padding: '8px 16px',
                background: '#e50914',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
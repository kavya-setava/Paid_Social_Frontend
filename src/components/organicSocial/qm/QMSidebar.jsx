import React, { useState } from 'react';
import {
  FaTicketAlt, FaUsers, FaChevronDown, FaChevronRight,
  FaClock, FaSpinner, FaCheckCircle, FaFlag, FaBan,
  FaPauseCircle, FaLock, FaCalendarAlt, FaTrash, FaStar, FaRedo
} from 'react-icons/fa';
import { MdOutlineQueue } from 'react-icons/md';

const NETFLIX_RED = '#E50914';
const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// ── Trafficking Status Metrics ─────────────────────────────────────────────
const metricsConfig = [
  { label: 'Total',           icon: FaTicketAlt,   tab: 'All',               color: '#e50914' },
  { label: 'Yet To Start',    icon: FaClock,        tab: 'Yet To Start',      color: '#f5a623' },
  { label: 'In Progress',     icon: FaSpinner,      tab: 'In Progress',       color: '#3b82f6' },
  { label: 'Completed',       icon: FaCheckCircle,  tab: 'Completed',         color: '#22c55e' },
  { label: 'Flagged',         icon: FaFlag,         tab: 'Flagged',           color: '#fb923c' },
  { label: 'Cancelled',       icon: FaBan,          tab: 'Cancelled',         color: '#ef4444' },
  { label: 'On Hold',         icon: FaPauseCircle,  tab: 'On Hold',           color: '#757575' },
  { label: 'QM On Hold',      icon: FaPauseCircle,  tab: 'Qm - On Hold',      color: '#a78bfa' },
  { label: 'Asset Locked',    icon: FaLock,         tab: 'Asset Locked',      color: '#60a5fa' },
  { label: 'Rescheduled',     icon: FaCalendarAlt,  tab: 'Rescheduled',       color: '#fbbf24' },
  { label: 'Removed',         icon: FaTrash,        tab: 'Removed',           color: '#f87171' },
  { label: 'Post Built',      icon: FaStar,         tab: 'Post Built - Debuts', color: '#4ade80' },
  { label: 'Rework',          icon: FaRedo,         tab: 'Rework',            color: '#f87171' },
];

const QMSidebar = ({ activeTab, setActiveTab, metrics, sidebarOpen }) => {
  const isTicketTab = metricsConfig.some(m => m.tab === activeTab);
  const [ticketsOpen, setTicketsOpen] = useState(isTicketTab || activeTab === 'All');
  const isAgentsActive = activeTab === 'Agents';

  return (
    <div style={{
      width: sidebarOpen ? '220px' : '64px',
      height: '100vh',
      background: '#111111',
      borderRight: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      flexShrink: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      scrollbarWidth: 'thin',
      scrollbarColor: '#2a2a2a transparent'
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex', alignItems: 'center',
        gap: '10px', minHeight: '64px', flexShrink: 0
      }}>
        <img
          src="/mediamintlogo.jpg"
          alt="Logo"
          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML +=
              `<div style="width:32px;height:32px;background:#e50914;border-radius:6px;
              display:flex;align-items:center;justify-content:center;font-weight:700;
              color:#fff;font-size:13px;flex-shrink:0">MM</div>`;
          }}
        />
        {sidebarOpen && (
          <span style={{
            fontWeight: '700', fontSize: '14px',
            color: '#fff', whiteSpace: 'nowrap', fontFamily: globalFont
          }}>
            QM Dashboard
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>

        {/* ══════════════════════════════
            MENU 1 — Tickets (collapsible)
        ══════════════════════════════ */}
        <div>
          {/* Tickets Parent */}
          <div
            onClick={() => {
              if (sidebarOpen) setTicketsOpen(p => !p);
              else setActiveTab('All');
            }}
            title={!sidebarOpen ? 'Tickets' : ''}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '10px', padding: '10px 10px',
              borderRadius: '8px', marginBottom: '2px',
              cursor: 'pointer',
              background: isTicketTab ? 'rgba(229,9,20,0.1)' : 'transparent',
              border: isTicketTab ? `1px solid ${NETFLIX_RED}30` : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isTicketTab) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isTicketTab) e.currentTarget.style.background = 'transparent';
            }}
          >
            <FaTicketAlt size={15} color={isTicketTab ? NETFLIX_RED : '#888'} style={{ flexShrink: 0 }} />

            {sidebarOpen && (
              <>
                <span style={{
                  flex: 1, fontSize: '13px', fontWeight: '700',
                  color: isTicketTab ? '#fff' : '#aaa',
                  whiteSpace: 'nowrap', fontFamily: globalFont
                }}>
                  Tickets
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '700',
                  padding: '1px 7px', borderRadius: '999px',
                  background: isTicketTab ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.07)',
                  color: isTicketTab ? NETFLIX_RED : '#555',
                  marginRight: '4px'
                }}>
                  {metrics?.['All'] ?? 0}
                </span>
                {ticketsOpen
                  ? <FaChevronDown size={10} color="#555" />
                  : <FaChevronRight size={10} color="#555" />
                }
              </>
            )}
          </div>

          {/* ── Submenu ── */}
          {(ticketsOpen || !sidebarOpen) && (
            <div style={{
              marginLeft: sidebarOpen ? '14px' : '0',
              borderLeft: sidebarOpen ? '1px solid #2a2a2a' : 'none',
              paddingLeft: sidebarOpen ? '8px' : '0',
              marginBottom: '4px'
            }}>
              {/* Submenu Label */}
              {sidebarOpen && (
                <div style={{
                  padding: '8px 8px 4px',
                  fontSize: '9px', fontWeight: '800',
                  color: '#8a90a0', textTransform: 'uppercase',
                  letterSpacing: '0.12em', fontFamily: globalFont
                }}>
                  Trafficking Status
                </div>
              )}

              {metricsConfig.map((m, i) => {
                const Icon = m.icon;
                const isActive = activeTab === m.tab;
                const count = metrics?.[m.tab] ?? 0;

                return (
                  <div
                    key={i}
                    onClick={() => setActiveTab(m.tab)}
                    title={!sidebarOpen ? m.label : ''}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: '9px',
                      padding: sidebarOpen ? '8px 8px' : '10px 10px',
                      borderRadius: '7px', marginBottom: '1px',
                      cursor: 'pointer',
                      background: isActive ? `${m.color}18` : 'transparent',
                      border: isActive ? `1px solid ${m.color}40` : '1px solid transparent',
                      transition: 'all 0.18s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon
                      size={12}
                      color={isActive ? m.color : '#555'}
                      style={{ flexShrink: 0 }}
                    />

                    {sidebarOpen && (
                      <>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isActive ? '700' : '500',
                          color: isActive ? '#fff' : '#c2c8d2',
                          flex: 1, whiteSpace: 'nowrap',
                          fontFamily: globalFont
                        }}>
                          {m.label}
                        </span>

                        {/* Count pill */}
                        <span style={{
                          fontSize: '10px', fontWeight: '700',
                          padding: '1px 6px', borderRadius: '999px',
                          background: isActive
                            ? `${m.color}30`
                            : count > 0 ? 'rgba(255,255,255,0.06)' : 'transparent',
                          color: isActive ? m.color : count > 0 ? '#555' : '#333'
                        }}>
                          {count}
                        </span>
                      </>
                    )}

                    {/* Collapsed dot */}
                    {!sidebarOpen && count > 0 && (
                      <span style={{
                        position: 'absolute', top: '5px', right: '5px',
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: m.color
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: '1px', background: '#1e1e1e', margin: '8px 4px' }} />

        {/* ══════════════════════════════
            MENU 2 — Agents
        ══════════════════════════════ */}
        <div
          onClick={() => setActiveTab('Agents')}
          title={!sidebarOpen ? 'Agents' : ''}
          style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', padding: '10px 10px',
            borderRadius: '8px', cursor: 'pointer',
            background: isAgentsActive ? 'rgba(229,9,20,0.14)' : 'transparent',
            border: isAgentsActive ? `1px solid ${NETFLIX_RED}40` : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isAgentsActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            if (!isAgentsActive) e.currentTarget.style.background = 'transparent';
          }}
        >
          <FaUsers size={15} color={isAgentsActive ? NETFLIX_RED : '#888'} style={{ flexShrink: 0 }} />
          {sidebarOpen && (
            <span style={{
              fontSize: '13px', fontWeight: '700',
              color: isAgentsActive ? '#fff' : '#aaa',
              whiteSpace: 'nowrap', fontFamily: globalFont
            }}>
              Agents
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export { metricsConfig };
export default QMSidebar;
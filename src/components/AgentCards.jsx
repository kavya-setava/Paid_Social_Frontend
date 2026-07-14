import React from 'react';
import { 
  FaTicketAlt, FaUserCheck, FaCalendarAlt, FaExchangeAlt,
  FaPauseCircle, FaCheckCircle, FaHandshake
} from 'react-icons/fa';

const NETFLIX_RED = '#E50914';

const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

export default function AgentCards({ statusCounts, activeTab, setActiveTab }) {
  const metrics = {
    Assigned: statusCounts.Assigned || 0,
    Calender_Invite: statusCounts.Calender_Invite || 0,
    Reassigned: statusCounts.Reassigned || 0,
    On_Hold: statusCounts.On_Hold || 0,
    QA_Pending: statusCounts.Completed || 0,
    Handoff: statusCounts.handoff || 0,
  };

  metrics.Total =
    metrics.Assigned +
    metrics.Calender_Invite +
    metrics.Reassigned +
    metrics.On_Hold +
    metrics.QA_Pending +
    metrics.Handoff;

  const metricsConfig = [
    { label: 'Total Tickets',   value: metrics.Total,          icon: FaTicketAlt,   tab: 'All' },
    { label: 'Assigned',        value: metrics.Assigned,       icon: FaUserCheck,   tab: 'Assigned' },
    { label: 'Calendar Invite', value: metrics.Calender_Invite,icon: FaCalendarAlt, tab: 'Calendar Invite' },
    { label: 'Reassigned',      value: metrics.Reassigned,     icon: FaExchangeAlt, tab: 'Reassigned' },
    { label: 'On Hold',         value: metrics.On_Hold,        icon: FaPauseCircle, tab: 'On Hold' },
    { label: 'Handoff',         value: metrics.Handoff,        icon: FaHandshake,   tab: 'Handoff' },
    { label: 'Completed',       value: metrics.QA_Pending,     icon: FaCheckCircle, tab: 'Completed' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
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
              cursor: 'pointer',
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
            {/* Icon + Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                color: '#9CA3AF',
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
                  color: 'white',
                }}
              >
                {m.label}
              </p>
            </div>

            {/* Count */}
            <p
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: NETFLIX_RED,
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: globalFont,
                lineHeight: 1,
              }}
            >
              {m.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
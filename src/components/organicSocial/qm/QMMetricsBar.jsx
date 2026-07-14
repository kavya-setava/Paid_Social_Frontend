import React from 'react';
import { metricsConfig } from './QMSidebar';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// ── Beautiful gradient backgrounds per status ──────────────────────────────
const CARD_THEMES = {
  'All':                {
    gradient: 'linear-gradient(135deg, #e50914 0%, #b91c1c 100%)',
    glow: 'rgba(229,9,20,0.35)',
    icon: '🎫'
  },
  'Yet To Start':       {
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    glow: 'rgba(245,158,11,0.35)',
    icon: '⏳'
  },
  'In Progress':        {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    glow: 'rgba(59,130,246,0.35)',
    icon: '⚡'
  },
  'Completed':          {
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    glow: 'rgba(34,197,94,0.35)',
    icon: '✅'
  },
  'Flagged':            {
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    glow: 'rgba(251,146,60,0.35)',
    icon: '🚩'
  },
  'Cancelled':          {
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    glow: 'rgba(239,68,68,0.35)',
    icon: '🚫'
  },
  'On Hold':            {
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    glow: 'rgba(107,114,128,0.35)',
    icon: '⏸️'
  },
  'Qm - On Hold':       {
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    glow: 'rgba(167,139,250,0.35)',
    icon: '🔒'
  },
  'Asset Locked':       {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
    glow: 'rgba(96,165,250,0.35)',
    icon: '🔐'
  },
  'Rescheduled':        {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
    glow: 'rgba(251,191,36,0.35)',
    icon: '📅'
  },
  'Removed':            {
    gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    glow: 'rgba(248,113,113,0.35)',
    icon: '🗑️'
  },
  'Post Built - Debuts':{
    gradient: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    glow: 'rgba(74,222,128,0.35)',
    icon: '🌟'
  },
  'Rework':             {
    gradient: 'linear-gradient(135deg, #f87171 0%, #b91c1c 100%)',
    glow: 'rgba(248,113,113,0.35)',
    icon: '🔁'
  },
};

const QMMetricsBar = ({ metrics, activeTab, setActiveTab }) => {
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .metric-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .metric-card:hover {
          transform: translateY(-4px) scale(1.02) !important;
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {metricsConfig.map((m, i) => {
          const theme = CARD_THEMES[m.tab] || {
            gradient: 'linear-gradient(135deg,#333,#222)',
            glow: 'rgba(255,255,255,0.1)',
            icon: '📋'
          };
          const isActive = activeTab === m.tab;
          const count    = metrics?.[m.tab] ?? 0;

          return (
            <div
              key={i}
              className="metric-card"
              onClick={() => setActiveTab(m.tab)}
              style={{
                position: 'relative',
                borderRadius: '14px',
                padding: '16px 12px',
                cursor: 'pointer',
                overflow: 'hidden',
                userSelect: 'none',
                // ── Active: full gradient bg ──
                background: isActive
                  ? theme.gradient
                  : '#1a1a1a',
                border: isActive
                  ? '1px solid transparent'
                  : `1px solid ${m.color}25`,
                boxShadow: isActive
                  ? `0 8px 24px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.4)`
                  : '0 2px 6px rgba(0,0,0,0.3)',
                transform: isActive ? 'translateY(-3px)' : 'none',
              }}
            >
              {/* ── Subtle gradient overlay when NOT active ── */}
              {!isActive && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: theme.gradient,
                  opacity: 0.08,
                  borderRadius: '14px',
                  pointerEvents: 'none'
                }} />
              )}

              {/* ── Glowing top border when active ── */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '10%',
                  right: '10%', height: '1px',
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: '999px',
                  pointerEvents: 'none'
                }} />
              )}

              {/* ── Card Content ── */}
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
                gap: '6px'
              }}>

                {/* Emoji Icon */}
                <span style={{ fontSize: '18px', lineHeight: 1 }}>
                  {theme.icon}
                </span>

                {/* Label */}
                <span style={{
                  fontSize: '9px', fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isActive ? 'rgba(255,255,255,0.9)' : '#9ca3af',
                  fontFamily: globalFont,
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }}>
                  {m.label}
                </span>

                {/* Count */}
                <div style={{
                  fontSize: '28px', fontWeight: '900',
                  color: isActive ? '#ffffff' : m.color,
                  lineHeight: 1, fontFamily: globalFont,
                  textShadow: isActive
                    ? '0 2px 10px rgba(0,0,0,0.3)'
                    : 'none'
                }}>
                  {count}
                </div>

                {/* Active indicator dot */}
                {isActive && (
                  <div style={{
                    width: '20px', height: '3px',
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '999px',
                    marginTop: '2px'
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default QMMetricsBar;
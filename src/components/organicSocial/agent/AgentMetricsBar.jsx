import React, { useMemo } from 'react';
import { METRIC_CONFIG, globalFont } from './AgentDashboardConstants';

const AgentMetricsBar = ({ tickets, activeTab, setActiveTab }) => {

  const counts = useMemo(() => {
    const c = { All: tickets.length };
    ['In Progress', 'Completed', 'On Hold', 'Flagged'].forEach(s => {
      c[s] = tickets.filter(t => t.traffickingStatus === s).length;
    });
    return c;
  }, [tickets]);

  return (
    <>
      <style>{`
        @keyframes agentCardPulse {
          0%,100% { opacity:1; }
          50% { opacity:0.75; }
        }
      `}</style>

      {/* ── Outer wrapper — single row, no extra spacing ── */}
      <div style={{
        marginBottom: '20px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        gap: '14px'
      }}>
        {METRIC_CONFIG.map((m, i) => (
          <MetricCard
            key={i}
            m={m}
            count={counts[m.tab] ?? 0}
            isActive={activeTab === m.tab}
            onClick={() => setActiveTab(m.tab)}
          />
        ))}
      </div>
    </>
  );
};

// ── Single Metric Card ─────────────────────────────────────────────────────
const MetricCard = ({ m, count, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: '160px',
        height: '160px',
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        flexShrink: 0,
        background: isActive ? m.gradient : '#1a1a1a',
        border: isActive ? '1.5px solid transparent' : '1.5px solid #2a2a2a',
        boxShadow: isActive
          ? `0 8px 28px ${m.glow}, 0 2px 8px rgba(0,0,0,0.5)`
          : '0 2px 8px rgba(0,0,0,0.4)',
        transform: isActive ? 'translateY(-3px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.border = `1.5px solid ${m.glow}`;
          e.currentTarget.style.boxShadow = `0 6px 20px ${m.glow}`;
          e.currentTarget.style.background = '#222';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.border = '1.5px solid #2a2a2a';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
          e.currentTarget.style.background = '#1a1a1a';
        }
      }}
    >
      {!isActive && (
        <div style={{
          position: 'absolute', inset: 0,
          background: m.gradient,
          opacity: 0.06,
          borderRadius: '20px',
          pointerEvents: 'none'
        }} />
      )}

      {isActive && (
        <div style={{
          position: 'absolute',
          top: 0, left: '20%', right: '20%',
          height: '1px',
          background: 'rgba(255,255,255,0.35)',
          borderRadius: '999px',
          pointerEvents: 'none'
        }} />
      )}

      <div style={{
        position: 'relative', zIndex: 1,
        width: '40px', height: '40px',
        borderRadius: '12px',
        background: isActive ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        lineHeight: 1,
        border: isActive
          ? '1px solid rgba(255,255,255,0.25)'
          : '1px solid rgba(255,255,255,0.08)'
      }}>
        {m.icon}
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{
          fontSize: '36px',
          fontWeight: '900',
          color: isActive ? '#ffffff' : '#c2c8d2',
          lineHeight: 1,
          fontFamily: globalFont,
          textShadow: isActive ? '0 2px 12px rgba(0,0,0,0.3)' : 'none'
        }}>
          {count}
        </span>

        <span style={{
          fontSize: '10px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: isActive ? 'rgba(255,255,255,0.85)' : '#9ca3af',
          fontFamily: globalFont,
          lineHeight: 1.2
        }}>
          {m.label}
        </span>
      </div>

      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: '20%', right: '20%',
          height: '2px',
          background: 'rgba(255,255,255,0.4)',
          borderRadius: '999px 999px 0 0',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
};

export default AgentMetricsBar;
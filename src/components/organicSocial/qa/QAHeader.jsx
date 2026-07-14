// src/components/organicSocial/qa/QAHeader.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.Provider';
import useBreak from '../../../utils/hooks/useBreak';

// ── Constants ──────────────────────────────────────────────────────────────
const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const ROLE_CONFIG = {
  "QM":    { label: "Queue Manager", color: "#10b981", icon: "📋" },
  "AGENT": { label: "Agent",         color: "#3b82f6", icon: "🎬" },
  "QA":    { label: "QA Reviewer",   color: "#8b5cf6", icon: "🔍" },
};

const ROLE_ROUTES = {
  "QM":    "/qm",
  "AGENT": "/agent",
  "QA":    "/qa",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatBreakTime = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) {
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const getBreakColor = (secs) => {
  if (secs < 300) return '#22c55e';
  if (secs < 600) return '#f59e0b';
  if (secs < 900) return '#fb923c';
  return '#ef4444';
};

const getBreakLabel = (secs) => {
  if (secs < 300) return 'Short break';
  if (secs < 600) return 'Taking a while...';
  if (secs < 900) return 'Getting long...';
  return '⚠️ Break too long!';
};

// ── Break Timer Hook ───────────────────────────────────────────────────────
const useBreakTimer = (isOnBreak) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOnBreak) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isOnBreak]);

  return elapsed;
};

// ── QA Header Component ────────────────────────────────────────────────────
const QAHeader = ({ onBreakChange }) => {
  const [showMenu, setShowMenu]                 = useState(false);
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);

  const navigate                     = useNavigate();
  const { user, logout, switchRole } = useAuth(); // ✅ inside component

  // User-level break (persisted via API; gates assignment across all roles).
  const { isOnBreak, elapsed: breakSeconds, start: startBreak, end: endBreak } = useBreak();
  const breakColor   = getBreakColor(breakSeconds);

  useEffect(() => { onBreakChange?.(isOnBreak); }, [isOnBreak]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ User from AuthContext
  const displayName  = user?.name  || 'QA User';
  const displayEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const currentRole  = user?.role?.trim().toUpperCase() || 'QA';
  const allRoles     = user?.roles || [];
  const roleColor    = ROLE_CONFIG[currentRole]?.color || '#8b5cf6';

  // ✅ Handlers
  const handleLogout = () => { logout(); navigate('/login'); };

  const handleRoleSwitch = async (roleName) => {
    const newRole = roleName.trim().toUpperCase();
    setShowMenu(false);
    const result = await switchRole(newRole);
    if (result?.success) {
      navigate(ROLE_ROUTES[newRole] || '/login');
    } else {
      alert(result?.message || 'Could not switch role');
    }
  };

  const handleGoOnBreak  = () => { setShowBreakConfirm(true); setShowMenu(false); };
  const confirmBreak     = async () => {
    const res = await startBreak('');
    if (res?.success) { setShowBreakConfirm(false); onBreakChange?.(true); }
    else alert(res?.message || 'Could not start break');
  };
  const handleBackToWork = async () => {
    const res = await endBreak();
    if (res?.success) onBreakChange?.(false);
    else alert(res?.message || 'Could not end break');
  };

  // ── Segment data for break progress ──
  const breakSegments = [
    { threshold: 300, color: '#22c55e', label: '5m'   },
    { threshold: 600, color: '#f59e0b', label: '10m'  },
    { threshold: 900, color: '#fb923c', label: '15m'  },
    { threshold: 901, color: '#ef4444', label: '15m+' },
  ];

  return (
    <>
      <style>{`
        @keyframes qaDotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.4); }
        }
        @keyframes qaBreakWarn {
          from { opacity:0.7; }
          to   { opacity:1; }
        }
      `}</style>

      {/* ════════ BREAK OVERLAY ════════ */}
      {isOnBreak && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.88)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: '#1a1a1a',
            border: `1px solid ${breakColor}30`,
            borderRadius: '24px', padding: '48px 40px',
            textAlign: 'center', maxWidth: '440px', width: '90%',
            boxShadow: `0 25px 60px rgba(0,0,0,0.8), 0 0 40px ${breakColor}15`,
            fontFamily: globalFont,
          }}>
            {/* Icon */}
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: `${breakColor}18`, border: `2px solid ${breakColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', margin: '0 auto 24px',
              boxShadow: `0 0 20px ${breakColor}20`
            }}>☕</div>

            <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '900', color: '#fff' }}>
              You're on Break
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: breakColor, fontWeight: '700' }}>
              {getBreakLabel(breakSeconds)}
            </p>

            {/* Timer Box */}
            <div style={{
              background: '#111', border: `1px solid ${breakColor}30`,
              borderRadius: '16px', padding: '20px 28px', marginBottom: '24px'
            }}>
              <p style={{
                margin: '0 0 8px', fontSize: '11px', fontWeight: '700',
                color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em'
              }}>
                Break Duration
              </p>
              <div style={{
                fontFamily: 'monospace', fontSize: '48px', fontWeight: '900',
                color: breakColor, lineHeight: 1, letterSpacing: '0.05em',
                textShadow: `0 0 20px ${breakColor}50`
              }}>
                {formatBreakTime(breakSeconds)}
              </div>

              {/* Progress segments */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '14px' }}>
                {breakSegments.map((seg, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{
                      height: '4px', borderRadius: '999px',
                      background: breakSeconds >= seg.threshold ? seg.color : '#2a2a2a',
                      transition: 'background 0.4s'
                    }} />
                    <div style={{
                      fontSize: '9px', textAlign: 'center',
                      marginTop: '4px', fontWeight: '700',
                      color: breakSeconds >= seg.threshold ? seg.color : '#333'
                    }}>
                      {seg.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Info */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', marginBottom: '24px', padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
              border: '1px solid #2a2a2a'
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: `linear-gradient(135deg,${breakColor},${breakColor}aa)`,
                color: '#fff', fontWeight: '700', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {avatarLetter}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#fff' }}>
                  {displayName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: breakColor, display: 'inline-block',
                    animation: 'qaDotPulse 1.5s ease-in-out infinite'
                  }} />
                  <span style={{ fontSize: '11px', color: breakColor, fontWeight: '600' }}>
                    On Break · {formatBreakTime(breakSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Back to Work */}
            <button onClick={handleBackToWork} style={{
              width: '100%', padding: '15px 24px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg,#22c55e,#15803d)',
              color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
              fontFamily: globalFont, boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}>
              ✅ Back to Work
            </button>

            {breakSeconds >= 900 && (
              <p style={{
                margin: '14px 0 0', fontSize: '12px', color: '#ef4444', fontWeight: '600',
                animation: 'qaBreakWarn 1s ease-in-out infinite alternate'
              }}>
                ⚠️ Break is too long. Please return to work.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ════════ BREAK CONFIRM MODAL ════════ */}
      {showBreakConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            borderRadius: '16px', padding: '32px',
            width: '360px', maxWidth: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            fontFamily: globalFont, textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>☕</div>
            <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              Going on Break?
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              A timer will start tracking your break duration.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowBreakConfirm(false)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                border: '1px solid #333', background: '#222',
                color: '#aaa', fontWeight: '600', fontSize: '13px',
                cursor: 'pointer', fontFamily: globalFont
              }}>
                Cancel
              </button>
              <button onClick={confirmBreak} style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: '#fff', fontWeight: '700', fontSize: '13px',
                cursor: 'pointer', fontFamily: globalFont,
                boxShadow: '0 4px 14px rgba(245,158,11,0.3)'
              }}>
                ☕ Start Break
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MAIN HEADER ════════ */}
      <header style={{
        height: '64px', background: '#1a1a1a',
        borderBottom: `1px solid ${isOnBreak ? `${breakColor}30` : '#2a2a2a'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 20,
        flexShrink: 0, boxSizing: 'border-box', width: '100%',
        transition: 'border-color 0.5s'
      }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: globalFont }}>
              Organic Social
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#555', fontFamily: globalFont }}>
              QA Dashboard
            </p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Logo */}
          <img src="/mediamintlogo.jpg" alt="MediaMint"
            style={{ height: '26px', borderRadius: '4px', objectFit: 'contain' }}
            onError={(e) => e.target.style.display = 'none'}
          />

          {/* Break timer pill */}
          {isOnBreak && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '6px 12px', borderRadius: '8px',
              background: `${breakColor}15`, border: `1px solid ${breakColor}35`
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: breakColor, boxShadow: `0 0 6px ${breakColor}`,
                animation: 'qaDotPulse 1.2s ease-in-out infinite', flexShrink: 0
              }} />
              <span style={{
                fontFamily: 'monospace', fontSize: '14px',
                fontWeight: '800', color: breakColor, letterSpacing: '0.04em'
              }}>
                {formatBreakTime(breakSeconds)}
              </span>
            </div>
          )}

          {/* Break / Back button */}
          {!isOnBreak ? (
            <button onClick={handleGoOnBreak} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              border: '1px solid rgba(245,158,11,0.35)',
              background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: globalFont
            }}>☕ Go on Break</button>
          ) : (
            <button onClick={handleBackToWork} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              border: '1px solid rgba(34,197,94,0.35)',
              background: 'rgba(34,197,94,0.1)', color: '#22c55e',
              fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: globalFont
            }}>✅ Back to Work</button>
          )}

          {/* Role badge */}
          <span style={{
            padding: '4px 12px', borderRadius: '20px',
            background: `${roleColor}20`, border: `1px solid ${roleColor}40`,
            fontSize: '11px', fontWeight: '700',
            color: roleColor, fontFamily: globalFont, letterSpacing: '0.05em'
          }}>
            {ROLE_CONFIG[currentRole]?.icon} {currentRole}
          </span>

          {/* Avatar + Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowMenu(p => !p)}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `linear-gradient(135deg,${roleColor},${roleColor}88)`,
                color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', userSelect: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {avatarLetter}
              <span style={{
                position: 'absolute', bottom: '1px', right: '1px',
                width: '9px', height: '9px', borderRadius: '50%',
                background: isOnBreak ? breakColor : '#22c55e',
                border: '2px solid #1a1a1a',
                boxShadow: `0 0 5px ${isOnBreak ? breakColor : 'rgba(34,197,94,0.6)'}`,
                transition: 'all 0.5s'
              }} />
            </div>

            {/* Dropdown */}
            {showMenu && (
              <div style={{
                position: 'absolute', top: '48px', right: 0,
                background: '#1e1e1e', border: '1px solid #2a2a2a',
                borderRadius: '12px', width: '250px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
                padding: '12px', zIndex: 200
              }}>

                {/* ── User Info ── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  paddingBottom: '12px', borderBottom: '1px solid #2a2a2a', marginBottom: '8px'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: `linear-gradient(135deg,${roleColor},${roleColor}88)`,
                    color: '#fff', fontWeight: '700', fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {avatarLetter}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: '#fff', fontFamily: globalFont }}>
                      {displayName}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#555', fontFamily: globalFont }}>
                      {displayEmail}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: isOnBreak ? breakColor : '#22c55e', display: 'inline-block'
                      }} />
                      <span style={{ fontSize: '11px', fontWeight: '600', color: isOnBreak ? breakColor : '#22c55e' }}>
                        {isOnBreak ? `On Break · ${formatBreakTime(breakSeconds)}` : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Role Switcher ── */}
                {allRoles.length > 1 && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{
                      margin: '0 0 8px', fontSize: '10px', fontWeight: '700',
                      color: '#555', textTransform: 'uppercase',
                      letterSpacing: '0.1em', padding: '0 4px'
                    }}>
                      Switch Role
                    </p>

                    {allRoles.map((role) => {
                      const rName    = role.name.trim().toUpperCase();
                      const config   = ROLE_CONFIG[rName] || { label: role.name, color: '#64748b', icon: '👤' };
                      const isActive = rName === currentRole;

                      return (
                        <button
                          key={role.id || role.name}
                          onClick={() => !isActive && handleRoleSwitch(rName)}
                          style={{
                            width: '100%', textAlign: 'left',
                            padding: '9px 10px', marginBottom: '4px',
                            background: isActive ? `${config.color}20` : 'none',
                            border: isActive ? `1px solid ${config.color}40` : '1px solid transparent',
                            borderRadius: '8px',
                            cursor: isActive ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.2s', fontFamily: globalFont
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = `${config.color}15`;
                              e.currentTarget.style.borderColor = `${config.color}30`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'none';
                              e.currentTarget.style.borderColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: `${config.color}20`,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '14px', flexShrink: 0
                          }}>
                            {config.icon}
                          </div>
                          <span style={{
                            flex: 1, fontSize: '12px', fontWeight: '600',
                            color: isActive ? config.color : '#ccc'
                          }}>
                            {config.label}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '12px', color: config.color }}>✓</span>
                          )}
                        </button>
                      );
                    })}

                    <div style={{ height: '1px', background: '#2a2a2a', margin: '8px 0' }} />
                  </div>
                )}

                {/* ── Break Toggle ── */}
                {!isOnBreak ? (
                  <button onClick={handleGoOnBreak} style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px',
                    background: 'none', border: 'none', color: '#f59e0b',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    borderRadius: '8px', fontFamily: globalFont,
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    ☕ Go on Break
                  </button>
                ) : (
                  <button onClick={handleBackToWork} style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px',
                    background: 'none', border: 'none', color: '#22c55e',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    borderRadius: '8px', fontFamily: globalFont,
                    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    ✅ Back to Work
                  </button>
                )}

                {/* ── Sign Out ── */}
                <button onClick={handleLogout} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  background: 'none', border: 'none', color: '#ef4444',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  borderRadius: '8px', fontFamily: globalFont,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(127,29,29,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  🚪 Sign Out
                </button>

              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default QAHeader; // ✅ MUST be at bottom
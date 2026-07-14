import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.Provider';
import useBreak from '../../../utils/hooks/useBreak';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const fmtBreak = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
};

const ROLE_CONFIG = {
  "QM":    { label: "Queue Manager", color: "#e50914", icon: "📋" },
  "AGENT": { label: "Agent",         color: "#3b82f6", icon: "🎬" },
  "QA":    { label: "QA Reviewer",   color: "#8b5cf6", icon: "🔍" },
};

const ROLE_ROUTES = {
  "QM":    "/qm",
  "AGENT": "/agent",
  "QA":    "/qa",
};

const QMHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // ✅ INSIDE component
  const { user, logout, switchRole } = useAuth();

  // User-level break (persisted; makes this person unavailable for assignment
  // in any role they hold — QMs can also be agents/QAs).
  const { isOnBreak, elapsed: breakSeconds, start: startBreak, end: endBreak } = useBreak();

  const toggleBreak = async () => {
    const res = isOnBreak ? await endBreak() : await startBreak('');
    if (!res?.success) alert(res?.message || 'Break action failed');
  };

  const displayName  = user?.name  || 'QM User';
  const displayEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const currentRole  = user?.role?.trim().toUpperCase() || 'QM';
  const allRoles     = user?.roles || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Switch role → mint new token (backend) → navigate on success
  const handleRoleSwitch = async (roleName) => {
    const newRole = roleName.trim().toUpperCase();
    setShowUserMenu(false);
    const result = await switchRole(newRole);
    if (result?.success) {
      navigate(ROLE_ROUTES[newRole] || '/login');
    } else {
      alert(result?.message || 'Could not switch role');
    }
  };

  const roleColor = ROLE_CONFIG[currentRole]?.color || '#e50914';

  return (
    <header style={{
      height: '64px',
      background: '#1a1a1a',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      flexShrink: 0,
      boxSizing: 'border-box',
      width: '100%'
    }}>

      {/* ── Left ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => setSidebarOpen(p => !p)}
          style={{
            background: 'none', border: 'none', color: '#aaa',
            cursor: 'pointer', fontSize: '20px', lineHeight: 1,
            padding: '6px', borderRadius: '6px', transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          ☰
        </button>
        <div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: globalFont }}>
            Organic Social
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#555', fontFamily: globalFont }}>
            Queue Management Dashboard
          </p>
        </div>
      </div>

      {/* ── Right ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/mediamintlogo.jpg" alt="MediaMint"
          style={{ height: '26px', borderRadius: '4px', objectFit: 'contain' }}
          onError={(e) => e.target.style.display = 'none'}
        />

        {/* ☕ Break toggle */}
        <button
          onClick={toggleBreak}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '7px 14px', borderRadius: '20px',
            border: `1px solid ${isOnBreak ? '#f59e0b66' : '#333'}`,
            background: isOnBreak ? 'rgba(245,158,11,0.12)' : '#222',
            color: isOnBreak ? '#f59e0b' : '#ccc',
            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            fontFamily: globalFont, whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}
        >
          {isOnBreak ? (
            <>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b',
                boxShadow: '0 0 6px rgba(245,158,11,0.8)',
              }} />
              On Break · <span style={{ fontFamily: 'monospace' }}>{fmtBreak(breakSeconds)}</span> · End
            </>
          ) : '☕ Go on Break'}
        </button>

        {/* ✅ Current role badge */}
        <span style={{
          padding: '4px 12px', borderRadius: '20px',
          background: `${roleColor}20`,
          border: `1px solid ${roleColor}40`,
          fontSize: '11px', fontWeight: '700',
          color: roleColor, fontFamily: globalFont, letterSpacing: '0.05em'
        }}>
          {ROLE_CONFIG[currentRole]?.icon} {currentRole}
        </span>

        {/* Avatar + Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(p => !p)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: `linear-gradient(135deg,${roleColor},${roleColor}88)`,
              color: '#fff', fontWeight: '700', fontSize: '14px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              userSelect: 'none', transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {avatarLetter}
            <span style={{
              position: 'absolute', bottom: '1px', right: '1px',
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#22c55e', border: '2px solid #1a1a1a',
              boxShadow: '0 0 5px rgba(34,197,94,0.6)'
            }} />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '48px', right: 0,
              background: '#1e1e1e', border: '1px solid #2a2a2a',
              borderRadius: '12px', width: '250px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
              padding: '12px', zIndex: 200
            }}>

              {/* User Info */}
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
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>Available</span>
                  </div>
                </div>
              </div>

              {/* ✅ Role Switcher */}
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
                        <span style={{ flex: 1, fontSize: '12px', fontWeight: '600', color: isActive ? config.color : '#ccc' }}>
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

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px',
                  background: 'none', border: 'none', color: '#ef4444',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  borderRadius: '8px', fontFamily: globalFont,
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
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
  );
};

export default QMHeader;
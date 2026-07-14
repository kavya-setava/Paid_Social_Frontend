import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiCaller from "../utils/hooks/useApicaller";
import { useAuth } from "../context/AuthContext.Provider";
import socket from "../socket";

const LoginUI = ({ onLogin }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { fetchData } = useApiCaller();
  const globalFont = "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

  const colors = darkMode ? {
    bg: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    accent: '#e50914',
    accentLight: '#f87171',
    inputBg: '#0f172a',
    inputBorder: '#334155'
  } : {
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    accent: '#e50914',
    accentLight: '#fecaca',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0'
  };

  // ── Role → Route mapping (handles both DB names and legacy names) ────────
  const ROLE_ROUTES = {
    "AGENT":                    "/agent",
    "OPERATOR":                 "/agent",
    "QM":                       "/qm",
    "QUEUE MANAGER":            "/qm",
    "QUEUE MANAGER/LIVE QC'ER": "/qm",
    "QA":                       "/qa",
    "LIVE QC'ER":               "/qa",
  };

  // ── Google button click → get authUrl ──────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const data = await fetchData("get", "auth/google");
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // ── Handle Google callback (token in URL) ──────────────────────────────
  useEffect(() => {
    console.log("🔥 EFFECT RUNNING");

    const params  = new URLSearchParams(window.location.search);
    const idToken = params.get("id_token") || params.get("access_token");

    console.log("👉 Token:", idToken ? "EXISTS" : "NONE");

    if (!idToken) return;

    const googleLogin = async () => {
      try {
        const data = await fetchData("post", "auth/google/signin", {
          token: idToken,
        });

        console.log("✅ SIGNIN RESPONSE:", data);

        // ── ✅ CLEAN URL first ────────────────────────────────────────
        window.history.replaceState({}, document.title, "/login");

        // ── Multi-role: backend issued NO token, it wants a role choice ──
        // Stash the Google token + identity so the picker can re-call
        // signin with { token, role } and receive a role-scoped token.
        if (data?.needsRoleSelection) {
          console.log("👥 Multiple roles → role selection required");
          sessionStorage.setItem("pendingAuth", JSON.stringify({
            idToken,
            availableRoles: data.availableRoles || [],
            user:           data.user || {},
          }));
          navigate("/select-role");
          return;
        }

        // ── Single (or role-scoped) login → token present ─────────────
        if (data?.success && data?.token && data?.user) {

          localStorage.setItem("authToken",    data.token);
          localStorage.setItem("refreshToken", data.refreshToken);

          const roles      = data.user.roles || [];
          const activeName = (data.user.activeRole?.name || roles[0]?.name || "")
            .trim().toUpperCase();

          console.log("👤 Roles received:", roles, "| Active:", activeName);

          const userData = {
            name:        data.user.name,
            email:       data.user.email,
            mediamintId: data.user.mediamintId,
            roles:       roles,       // ← full roles array (for switch UI)
            role:        activeName,  // ← the active role from backend
            userId:      data.user.id,
          };

          login(userData);
          localStorage.setItem("user", JSON.stringify(userData));

          socket.emit("register", data.user.id);

          const route = ROLE_ROUTES[activeName] || "/login";
          console.log("🚀 Navigating to:", route);
          navigate(route);

        } else {
          // ── Login failed ──────────────────────────────────────────
          console.error("Login failed:", data?.message);
          alert(data?.message || "Login failed. Please contact admin.");
        }

      } catch (err) {
        console.error("❌ Sign-in API failed:", err);
        alert("Login failed. Please try again.");
        window.history.replaceState({}, document.title, "/login");
      }
    };

    googleLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── UI ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        height:          '100vh',
        background:      colors.bg,
        fontFamily:      globalFont,
        color:           colors.text,
        transition:      'all 0.3s ease',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '16px',
        position:        'relative',
        overflow:        'hidden',
        boxSizing:       'border-box'
      }}>

        {/* Animated BG blobs */}
        <div style={{
          position:     'absolute',
          top:          '-50%',
          right:        '-10%',
          width:        '600px',
          height:       '600px',
          background:   darkMode ? 'rgba(229, 9, 20, 0.05)' : 'rgba(229, 9, 20, 0.03)',
          borderRadius: '50%',
          filter:       'blur(80px)',
          animation:    'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position:     'absolute',
          bottom:       '-30%',
          left:         '-5%',
          width:        '500px',
          height:       '500px',
          background:   darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)',
          borderRadius: '50%',
          filter:       'blur(80px)'
        }} />

        {/* Main Card */}
        <div style={{
          position:        'relative',
          width:           '100%',
          maxWidth:        '1000px',
          display:         'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap:             '0',
          borderRadius:    '20px',
          overflow:        'hidden',
          boxShadow:       darkMode
            ? '0 25px 50px rgba(0, 0, 0, 0.5)'
            : '0 20px 50px rgba(0, 0, 0, 0.1)',
          backgroundColor: colors.surface,
          border:          `1px solid ${colors.border}`
        }}>

          {/* Left - Branding */}
          <div style={{
            background:     'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
            padding:        'clamp(30px, 5vw, 60px)',
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
            color:          '#ffffff'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize:    '13px',
                fontWeight:  '700',
                letterSpacing: '4px',
                color:       'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                borderLeft:  '3px solid #ffffff',
                paddingLeft: '12px',
                display:     'inline-block'
              }}>
                Netflix YT Ops
              </div>
            </div>

            <h1 style={{
              fontSize:      'clamp(36px, 5vw, 52px)',
              fontWeight:    '800',
              letterSpacing: '-1.5px',
              lineHeight:    '1.1',
              marginBottom:  '24px',
              color:         '#ffffff'
            }}>
              Queue Management <br />
              <span style={{ fontWeight: '300', color: 'rgba(255, 255, 255, 0.8)' }}>
                System.
              </span>
            </h1>

            <p style={{
              fontSize:      '17px',
              fontWeight:    '300',
              color:         'rgba(255, 255, 255, 0.85)',
              maxWidth:      '420px',
              lineHeight:    '1.6',
              letterSpacing: '0.2px'
            }}>
              Manage, track, and optimize your workflow with intelligent routing.
              Built for teams, designed for speed.
            </p>
          </div>

          {/* Right - Login Form */}
          <div style={{
            padding:         'clamp(30px, 5vw, 60px)',
            display:         'flex',
            flexDirection:   'column',
            justifyContent:  'center',
            backgroundColor: colors.surface
          }}>
            {/* Logo */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{
                width:          '80px',
                height:         '80px',
                margin:         '0 auto 20px',
                background:     colors.inputBg,
                borderRadius:   '16px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                border:         `2px solid ${colors.border}`,
                overflow:       'hidden'
              }}>
                <img
                  src="/mediamintlogo.jpg"
                  alt="MediaMint Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML =
                      `<div style="font-size:32px;font-weight:bold;color:${colors.accent}">MM</div>`;
                  }}
                />
              </div>
              <p style={{ fontSize: '15px', color: 'black', margin: '0', fontWeight: 'bold' }}>
                Secure login
              </p>
            </div>

            {/* Sign In Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleGoogleLogin}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '12px',
                  width:          '200px',
                  padding:        '16px 24px',
                  fontSize:       '16px',
                  fontWeight:     '600',
                  color:          '#ffffff',
                  background:     'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
                  border:         'none',
                  borderRadius:   '10px',
                  cursor:         'pointer',
                  transition:     'all 0.3s ease',
                  boxShadow:      '0 4px 15px rgba(229, 9, 20, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform  = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow  = '0 6px 20px rgba(229, 9, 20, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform  = 'translateY(0)';
                  e.currentTarget.style.boxShadow  = '0 4px 15px rgba(229, 9, 20, 0.2)';
                }}
              >
                Sign in
              </button>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', paddingTop: '24px', textAlign: 'center' }}>
              <div style={{ height: '1px', background: colors.border, width: '100%', marginBottom: '24px' }} />
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: '0' }}>
                Powered by{' '}
                <span style={{ fontWeight: '700', color: colors.text, letterSpacing: '0.5px' }}>
                  MediaMint
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position:      'fixed',
          bottom:        '24px',
          right:         '24px',
          width:         '50px',
          height:        '50px',
          borderRadius:  '50%',
          background:    darkMode ? '#e50914' : '#ffffff',
          border:        '2px solid #e50914',
          color:         darkMode ? '#ffffff' : '#e50914',
          fontSize:      '20px',
          cursor:        'pointer',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
          boxShadow:     '0 4px 15px rgba(0, 0, 0, 0.1)',
          transition:    'all 0.3s ease',
          zIndex:        100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(30px); }
        }
      `}</style>
    </>
  );
};

export default LoginUI;
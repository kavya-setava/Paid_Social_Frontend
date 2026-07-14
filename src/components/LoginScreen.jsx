import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useApiCaller from "../utils/hooks/useApicaller";
import { useAuth } from "../context/AuthContext.Provider";
import socket from "../socket";
import NetflixIntro from "./NetflixIntro";

const LoginUI = ({ onLogin }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
 const { login } = useAuth();
  const navigate = useNavigate();
  const { fetchData, isLoading } = useApiCaller();
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

  // Dummy login handler for testing the UI
  // const handleGoogleLogin = () => {
  //   if(onLogin) {
  //     onLogin({ name: "Harsha Vardhan", role: "QM" });
  //   } else {
  //     console.log("Google Sign-In clicked");
  //   }
  // };


  useEffect(() => {
  const timer = setTimeout(() => {
    setShowIntro(false);
  }, 3500);

  return () => clearTimeout(timer);
}, []);
  
const handleGoogleLogin = async () => {
  try {
    const data = await fetchData("get", "auth/google");

    if (data?.authUrl) {
      window.location.href = data.authUrl;
      console.log(data.authUrl,"ssssssssssssss")
    }
  } catch (error) {
    console.error("Google login error:", error);
  }
};
useEffect(() => {
  console.log("🔥 EFFECT RUNNING");

  const params = new URLSearchParams(window.location.search);
  const idToken = params.get("id_token");

  console.log("👉 Token:", idToken);

  if (!idToken) return;

const googleLogin = async () => {
  try {
    const data = await fetchData("post", "auth/google/signin", {
      token: idToken,
    });

    console.log("✅ SIGNIN RESPONSE:", data);

  if (data?.success && data?.user) {

  localStorage.setItem("authToken", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("refreshToken", data.refreshToken);

  const roleName = data.user.role?.name?.trim().toUpperCase();

  login({
    name: data.user.name,
    email: data.user.email,
    role: roleName,
    userId: data.user.id,
  });

  // ✅ SOCKET REGISTER
  socket.emit("register", data.user.id);

  console.log("Socket Registered:", data.user.id);

  const roleRoutes = {
    QM: "/qm",
    AGENT: "/agent",
    QA: "/qa",
  };

  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("authToken", data.token);

  setTimeout(() => {
    navigate(roleRoutes[roleName] || "/login");
  }, 100);
}
  } catch (err) {
    console.error("❌ Sign-in API failed:", err);
  }
};

  googleLogin();
}, []);
// fetchData, login, navigate

// if (showIntro) {
//   return <NetflixIntro />;
// }

  return (
    <>
      <div style={{
        height: '100vh',
        background: colors.bg,
        fontFamily: globalFont,
        color: colors.text,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: darkMode ? 'rgba(229, 9, 20, 0.05)' : 'rgba(229, 9, 20, 0.03)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }} />

        {/* Main Login Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px', 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '0',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: darkMode 
            ? '0 25px 50px rgba(0, 0, 0, 0.5)' 
            : '0 20px 50px rgba(0, 0, 0, 0.1)',
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
            padding: 'clamp(30px, 5vw, 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            {/* 1. Modern "Eyebrow" Kicker */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '4px',
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                borderLeft: '3px solid #ffffff',
                paddingLeft: '12px',
                display: 'inline-block'
              }}>
                Netflix YT Ops
              </div>
            </div>

            {/* 2. Cinema-style H1 (Mixed weights + Tight spacing) */}
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: '800',
              letterSpacing: '-1.5px',
              lineHeight: '1.1',
              marginBottom: '24px',
              color: '#ffffff'
            }}>
              Queue Management <br />
              <span style={{ fontWeight: '300', color: 'rgba(255, 255, 255, 0.8)' }}>System.</span>
            </h1>

            {/* 3. Elegant, thin paragraph text */}
            <p style={{
              fontSize: '17px',
              fontWeight: '300',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '420px',
              lineHeight: '1.6',
              letterSpacing: '0.2px'
            }}>
              Manage, track, and optimize your workflow with intelligent routing. 
              Built for teams, designed for speed.
            </p>
          </div>

          {/* Right Side - Login Form */}
          <div style={{
            padding: 'clamp(30px, 5vw, 60px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: colors.surface
          }}>
            {/* Logo Section */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                background: colors.inputBg,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${colors.border}`,
                overflow: 'hidden'
              }}>
                <img 
                  src="/mediamintlogo.jpg" 
                  alt="MediaMint Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div style="font-size:32px; font-weight:bold; color:${colors.accent}">MM</div>`;
                  }}
                />
              </div>
              {/* <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.text,
                margin: '0 0 8px 0'
              }}>
                Agent Access
              </h2> */}
              <p style={{
                fontSize: '15px',
                color: 'black',
                margin: '0',
                fontWeight:'bold'
              }}>
                Secure login 
              </p>
            </div>

            {/* Google Sign In Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleGoogleLogin}
           style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '200px',   // 👈 reduced width
  padding: '16px 24px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(229, 9, 20, 0.2)',
}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.2)';
                }}
              >
                {/* <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg> */}
                Sign in 
              </button>
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '40px', 
              paddingTop: '24px',
              textAlign: 'center',
            }}>
              <div style={{ height: '1px', background: colors.border, width: '100%', marginBottom: '24px' }} />
              <p style={{
                fontSize: '13px',
                color: colors.textMuted,
                margin: '0'
              }}>
                Powered by{' '}
                <span style={{
                  fontWeight: '700',
                  color: colors.text,
                  letterSpacing: '0.5px'
                }}>
                  MediaMint
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle - Bottom Right */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: darkMode ? '#e50914' : '#ffffff',
          border: `2px solid #e50914`,
          color: darkMode ? '#ffffff' : '#e50914',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          zIndex: 100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = darkMode 
            ? '0 6px 20px rgba(229, 9, 20, 0.3)' 
            : '0 6px 20px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </>
  );
};

export default LoginUI;
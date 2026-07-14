import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.Provider";
import useApiCaller from "../utils/hooks/useApicaller";

// ✅ Match EXACTLY what's in your DB: "AGENT", "QM", "QA"
const ROLE_CONFIG = {
  "AGENT": {
    icon:        "🎬",
    label:       "Agent",
    description: "Handle operations and tasks",
    route:       "/agent",
    color:       "#3b82f6",
  },
  "QM": {
    icon:        "📋",
    label:       "Queue Manager",
    description: "Manage queues and assignments",
    route:       "/qm",
    color:       "#10b981",
  },
  "QA": {
    icon:        "🔍",
    label:       "QA Reviewer",
    description: "Quality check and review",
    route:       "/qa",
    color:       "#8b5cf6",
  },
  // ✅ Also handle old role names just in case
  "OPERATOR": {
    icon:        "🎬",
    label:       "Agent",
    description: "Handle operations and tasks",
    route:       "/agent",
    color:       "#3b82f6",
  },
  "QUEUE MANAGER": {
    icon:        "📋",
    label:       "Queue Manager",
    description: "Manage queues and assignments",
    route:       "/qm",
    color:       "#10b981",
  },
  "LIVE QC'ER": {
    icon:        "🔍",
    label:       "Live QC'er",
    description: "Quality check and review",
    route:       "/qa",
    color:       "#8b5cf6",
  },
};

export default function OrganicSocialRoleSelector() {
  const navigate                  = useNavigate();
  const { user, login, switchRole } = useAuth();
  const { fetchData }             = useApiCaller();
  const [busyRole, setBusyRole]   = useState(null);

  // Mid-login multi-role state (Option B): backend gave us no token yet,
  // only the Google id_token + the list of roles the user may act as.
  let pending = null;
  try {
    const raw = sessionStorage.getItem("pendingAuth");
    if (raw) pending = JSON.parse(raw);
  } catch { pending = null; }

  // ✅ Neither logged in nor mid-login → back to login
  if (!user && !pending) {
    navigate("/login");
    return null;
  }

  // Identity + role list come from whichever source we have.
  const identity = pending?.user || user || {};
  const roleList = pending
    ? (pending.availableRoles || []).map((name) => ({ name }))
    : (user?.roles || []);

  // ✅ If only 1 role, redirect directly (context flow only)
  if (!pending && roleList.length === 1) {
    const roleName = roleList[0].name.trim().toUpperCase();
    const config   = ROLE_CONFIG[roleName];
    const route    = config?.route || "/login";
    navigate(route);
    return null;
  }

  const handleRoleSelect = async (role) => {
    const roleName = role.name.trim().toUpperCase();
    const config   = ROLE_CONFIG[roleName];

    console.log("🎯 Role selected:", roleName, "→ config:", config);

    if (!config) {
      console.error("❌ No config found for role:", roleName);
      alert(`No dashboard found for role: ${roleName}`);
      return;
    }

    // ── Option B: exchange the Google token for a ROLE-SCOPED token ──
    if (pending?.idToken) {
      setBusyRole(roleName);
      const data = await fetchData("post", "auth/google/signin", {
        token: pending.idToken,
        role:  role.name,
      });

      if (data?.success && data?.token && data?.user) {
        localStorage.setItem("authToken",    data.token);
        localStorage.setItem("refreshToken", data.refreshToken);

        const activeName = (data.user.activeRole?.name || role.name)
          .trim().toUpperCase();

        login({
          name:        data.user.name,
          email:       data.user.email,
          mediamintId: data.user.mediamintId,
          roles:       data.user.roles || [],
          role:        activeName,
          userId:      data.user.id,
        });

        sessionStorage.removeItem("pendingAuth");
        console.log("🚀 Navigating to:", config.route);
        navigate(config.route);
      } else {
        alert(data?.message || `Could not sign in as ${role.name}.`);
        setBusyRole(null);
      }
      return;
    }

    // ── Already logged in (context) → backend role-scoped token switch ──
    setBusyRole(roleName);
    const result = await switchRole(roleName);
    if (result?.success) {
      navigate(config.route);
    } else {
      alert(result?.message || `Could not switch to ${role.name}.`);
      setBusyRole(null);
    }
  };

  return (
    <div style={{
      minHeight:      "100vh",
      background:     "#0f172a",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "16px",
      fontFamily:     "'Inter', sans-serif",
    }}>
      <div style={{
        background:   "#1e293b",
        borderRadius: "20px",
        padding:      "40px",
        width:        "100%",
        maxWidth:     "480px",
        boxShadow:    "0 25px 50px rgba(0,0,0,0.5)",
        border:       "1px solid #334155",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width:          "64px",
            height:         "64px",
            borderRadius:   "50%",
            background:     "linear-gradient(135deg, #e50914, #b80710)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            margin:         "0 auto 16px",
            fontSize:       "28px",
          }}>
            👋
          </div>

          <h2 style={{
            color:      "#f1f5f9",
            fontSize:   "22px",
            fontWeight: "700",
            margin:     "0 0 8px",
          }}>
            Welcome, {identity.name}!
          </h2>

          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
            You have {roleList.length} roles. Select how you want to continue:
          </p>
        </div>

        {/* Role Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {roleList.map((role) => {
            const key    = role.name.trim().toUpperCase();
            const config = ROLE_CONFIG[key] || {
              icon:        "👤",
              label:       role.name,
              description: "Access your dashboard",
              color:       "#64748b",
              route:       "/login",
            };
            const isBusy = busyRole === key;

            return (
              <button
                key={role.id || role.name}
                onClick={() => handleRoleSelect(role)}
                disabled={!!busyRole}
                style={{
                  opacity: busyRole && !isBusy ? 0.5 : 1,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "16px",
                  padding:      "16px 20px",
                  background:   "#0f172a",
                  border:       "2px solid #334155",
                  borderRadius: "12px",
                  cursor:       "pointer",
                  textAlign:    "left",
                  transition:   "all 0.2s ease",
                  width:        "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = config.color;
                  e.currentTarget.style.background  = `${config.color}15`;
                  e.currentTarget.style.transform   = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.background  = "#0f172a";
                  e.currentTarget.style.transform   = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div style={{
                  width:          "48px",
                  height:         "48px",
                  borderRadius:   "12px",
                  background:     `${config.color}20`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       "24px",
                  flexShrink:     0,
                }}>
                  {config.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    color:        "#f1f5f9",
                    fontWeight:   "600",
                    fontSize:     "15px",
                    marginBottom: "4px",
                  }}>
                    {config.label}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "13px" }}>
                    {config.description}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: "#475569", fontSize: "18px" }}>
                  {isBusy ? "⏳" : "→"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop:      "24px",
          paddingTop:     "20px",
          borderTop:      "1px solid #334155",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
        }}>
          <span style={{ color: "#475569", fontSize: "12px" }}>
            {identity.email}
          </span>
          <span style={{ color: "#475569", fontSize: "12px" }}>
            {identity.mediamintId}
          </span>
        </div>

      </div>
    </div>
  );
}
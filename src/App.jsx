import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import PaidSocialLogin from "./paidSocial/pages/auth/Login/Login";
import Login from "./components/OrganicSocialLoginjsx";
import QMDashboard from "./components/OrganicSocialQMDashboard";
import AgentDashboard from "./components/OrganicSocialAgentDashboard";
import QADashboard from "./components/OrganicSocialQADashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import PaidSocialQMDashboard from "./paidSocial/pages/qm/pages/Dashboard"; // ✅ Added new Paid Social dashboard 
import ActiveAgents from "./components/ActiveAgents";
import QAChecklistWrapper from "./components/QAChecklistWrapper";
import AgentChecklistWrapper from "./components/AgentlistWrapper";
import OrganicSocialRoleSelector from "./components/OrganicSocialRoleSelector";
import ToastHost from "./components/ToastHost";
import ConfirmHost from "./components/ConfirmHost";
import { AuthProvider, useAuth } from "./context/AuthContext.Provider";
import { normalizeRole } from "./utils/role";
import "./App.css";
import PaidSocialAgentDashboard from './paidSocial/pages/agent/pages/Dashboard'

// ✅ Helper to get correct route for a user
function getDefaultRoute(user) {
  if (!user) return "/login";

  const roles = user.roles || [];
  const role = normalizeRole(user.role);

  if (roles.length > 1 && !role) return "/select-role";

  const ROLE_ROUTES = {
    "QM": "/qm",
    "AGENT": "/agent",
    "QA": "/qa",
  };

  return ROLE_ROUTES[role] || (roles.length > 1 ? "/select-role" : "/login");
}

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#141414", color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px",
            border: "3px solid #333",
            borderTop: "3px solid #e50914",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: "#888", margin: 0 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentUser = user
    ? {
      name: user.name || "",
      email: user.email || "",
      role: normalizeRole(user.role),
      roles: user.roles || [],
      userId: user.userId || "",
      mediamintId: user.mediamintId || "",
    }
    : null;
  const defaultRoute = currentUser ? getDefaultRoute(currentUser) : "/login";

  return (
    <div>
      <ToastHost />
      <ConfirmHost />
      <Routes>

        {/* ── Login ── */}
        <Route
          path="/login"
          element={
            currentUser
              ? <Navigate to={defaultRoute} replace />
              : <Login />
          }
        />
        {/* ── Paid Social Login ── */}
        <Route
          path="/paid/login"
          element={<PaidSocialLogin />}
        />

        {/* ── New Paid Social QM Dashboard Route ── */}
        {/* <Route
            path="/paid/qm"
            element={
              <ProtectedRoute allowedRole="QM">
                <PaidSocialQMDashboard />
              </ProtectedRoute>
            }
          /> */}

        <Route
          path="/paid/qm"
          element={<PaidSocialQMDashboard />}
        />
  <Route
          path="/paid/agent"
          element={<PaidSocialAgentDashboard />}
        />

        {/* ── Role Selector ── */}
        {/* Allowed either when logged in, or mid-login with a pending
            multi-role choice (Option B: no token issued yet). */}
        <Route
          path="/select-role"
          element={
            currentUser || sessionStorage.getItem("pendingAuth")
              ? <OrganicSocialRoleSelector />
              : <Navigate to="/login" replace />
          }
        />

        {/* ── QM Dashboard ── */}
        <Route
          path="/qm"
          element={
            <ProtectedRoute allowedRole="QM">
              <DashboardLayout>
                <QMDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Agent Dashboard ── */}
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRole="AGENT">
              <DashboardLayout>
                <AgentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── QA Dashboard ── */}
        <Route
          path="/qa"
          element={
            <ProtectedRoute allowedRole="QA">
              <DashboardLayout>
                <QADashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Active Agents ── */}
        <Route
          path="/agents"
          element={
            <DashboardLayout>
              <ActiveAgents />
            </DashboardLayout>
          }
        />

        {/* ── QA Checklist ── */}
        <Route
          path="/qa-checklist/:qaReviewId"
          element={
            <DashboardLayout>
              <QAChecklistWrapper />
            </DashboardLayout>
          }
        />

        {/* ── Agent Checklist ── */}
        <Route
          path="/agent-checklist/:qaReviewId"
          element={
            <DashboardLayout>
              <AgentChecklistWrapper />
            </DashboardLayout>
          }
        />

        {/* ── Default / ── */}
        <Route
          path="/"
          element={
            currentUser
              ? <Navigate to={defaultRoute} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ── Catch All ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </div>
  );
}

// ✅ AuthProvider wraps everything - only ONE place
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
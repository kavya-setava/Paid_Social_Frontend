import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.Provider";
import { normalizeRole } from "../utils/role";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = normalizeRole(user.role);

  console.log("🔒 ProtectedRoute check:", { currentRole, allowedRole });

  // ✅ If no role selected yet → go to role selector
  if (!currentRole) {
    return <Navigate to="/select-role" replace />;
  }

  // ✅ Direct match: "QM" === "QM", "AGENT" === "AGENT", "QA" === "QA"
  if (allowedRole && currentRole !== allowedRole) {
    const roleRoutes = {
      "QM":    "/qm",
      "AGENT": "/agent",
      "QA":    "/qa",
    };
    const redirectTo = roleRoutes[currentRole] || "/select-role";
    console.log("🔒 Wrong role, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
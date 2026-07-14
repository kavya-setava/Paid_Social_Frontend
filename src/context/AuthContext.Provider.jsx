// context/AuthContext.Provider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import useApiCaller from "../utils/hooks/useApicaller";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchData }         = useApiCaller();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // ✅ Switch active role without re-login.
  // Option B: the JWT carries a single active role, so we must ask the
  // backend to mint a NEW role-scoped token — updating localStorage alone
  // would leave the token (and therefore all API authz) on the old role.
  // Returns { success, role? , message? } so callers can navigate on success.
  const switchRole = async (roleName) => {
    const desired = roleName.trim().toUpperCase();

    const data = await fetchData("post", "auth/switch-role", { role: desired });

    if (data?.success && data?.token && data?.user) {
      localStorage.setItem("authToken", data.token);

      const activeName = (data.user.activeRole?.name || desired)
        .trim().toUpperCase();

      const updatedUser = {
        name:        data.user.name,
        email:       data.user.email,
        mediamintId: data.user.mediamintId,
        roles:       data.user.roles || [],
        role:        activeName,
        userId:      data.user.id,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, role: activeName };
    }

    return { success: false, message: data?.message || "Could not switch role" };
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};
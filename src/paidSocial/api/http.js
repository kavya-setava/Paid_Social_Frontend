// Axios instance for the Paid-Social API.
//
// - Base URL: http://localhost:5000/api/paidSocial
// - Attaches the paid-social Bearer token on every request.
// - On a 401 it tries the refresh-token endpoint once, then retries.
import axios from "axios";
import { getToken, setToken, clearSession } from "./session";

export const PAID_BASE_URL = "http://localhost:5000/api/paidSocial";

const http = axios.create({
  baseURL: PAID_BASE_URL,
  withCredentials: true, // send/receive the refresh cookie
  headers: { "Content-Type": "application/json" },
});

// ── Attach the Bearer token ──────────────────────────────────────────────
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Refresh-on-401 (single retry) ─────────────────────────────────────────
let refreshing = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        // De-dupe concurrent refreshes into a single request.
        refreshing =
          refreshing ||
          axios.post(`${PAID_BASE_URL}/auth/refreshToken`, {}, { withCredentials: true });
        const { data } = await refreshing;
        refreshing = null;

        if (data?.token) {
          setToken(data.token);
          original.headers.Authorization = `Bearer ${data.token}`;
          return http(original);
        }
      } catch (refreshErr) {
        refreshing = null;
        clearSession();
        // Send the user back to the paid-social login.
        if (!window.location.pathname.startsWith("/paid/login")) {
          window.location.href = "/paid/login";
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default http;

// useTicketLive — real-time ticket updates over Socket.IO.
//
// Connects the shared socket (configured with autoConnect:false), registers
// the logged-in user so the backend can target them, and calls `onRefetch`
// whenever a TICKET_EVENT arrives — so the dashboard reloads WITHOUT a page
// refresh. If the event is addressed to this user (notifyUserId === my id) and
// carries a message, it also raises an in-app toast + a desktop notification.
import { useEffect, useRef } from "react";
import socket from "../../socket";

export default function useTicketLive(userId, onRefetch) {
  const cbRef = useRef(onRefetch);
  cbRef.current = onRefetch;

  useEffect(() => {
    if (!userId) {
      console.warn("[live] no userId yet — socket not registered");
      return;
    }
    const id = String(userId);

    const register = () => {
      socket.emit("register", id);
      console.log("[live] register →", id, "(connected:", socket.connected, ")");
    };

    const onConnect = () => {
      console.log("[live] socket connected:", socket.id);
      register();
    };
    const onConnectError = (err) =>
      console.error("[live] socket connect_error:", err?.message || err);

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    if (socket.connected) register();      // already up → register now
    else socket.connect();                 // otherwise open the connection

    // Desktop-notification permission (once).
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const handler = (payload) => {
      console.log("[live] TICKET_EVENT", payload);
      cbRef.current?.(payload);

      const forMe = payload?.notifyUserId && String(payload.notifyUserId) === id;
      if (forMe && payload?.message) {
        window.dispatchEvent(new CustomEvent("app-toast", { detail: payload.message }));
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification("Netflix Socialite", { body: payload.message }); } catch { /* ignore */ }
        }
      }
    };
    socket.on("TICKET_EVENT", handler);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("TICKET_EVENT", handler);
    };
  }, [userId]);
}

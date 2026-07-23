// Subscribes to the backend's PAID_TICKET_EVENT stream and:
//   1) calls `onEvent` (debounced) so the current dashboard re-fetches once
//      even when a burst of events arrives (e.g. auto-assign, bulk actions), and
//   2) surfaces a personal toast when evt.notifyUserId === my id.
//
// Uses the shared socket instance (src/socket.js). Registers with the
// logged-in paid-social user id.
import { useEffect, useRef } from "react";
import socket from "../../socket";
import { getUser } from "../api/session";
import { toastInfo } from "../utils/toast";

const REFETCH_DEBOUNCE_MS = 700;

export default function usePaidSocket(onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const user = getUser();
    const myId = user?.id;

    if (!socket.connected) socket.connect();
    if (myId) socket.emit("register", myId);

    let timer = null;
    const handle = (evt) => {
      // Personal toast fires immediately per event.
      if (evt?.notifyUserId && evt.notifyUserId === myId && evt.message) {
        toastInfo(evt.message);
      }
      // Coalesce refetches: many events in quick succession → one refetch.
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (typeof handlerRef.current === "function") handlerRef.current(evt);
      }, REFETCH_DEBOUNCE_MS);
    };

    socket.on("PAID_TICKET_EVENT", handle);
    return () => {
      clearTimeout(timer);
      socket.off("PAID_TICKET_EVENT", handle);
    };
  }, []);
}

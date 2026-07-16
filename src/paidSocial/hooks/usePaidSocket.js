// Subscribes to the backend's PAID_TICKET_EVENT stream and:
//   1) calls `onEvent` so the current dashboard can re-fetch its list, and
//   2) surfaces a personal toast when evt.notifyUserId === my id.
//
// Uses the shared socket instance (src/socket.js). Registers with the
// logged-in paid-social user id.
import { useEffect, useRef } from "react";
import socket from "../../socket";
import { getUser } from "../api/session";
import { toastInfo } from "../utils/toast";

export default function usePaidSocket(onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const user = getUser();
    const myId = user?.id;

    if (!socket.connected) socket.connect();
    if (myId) socket.emit("register", myId);

    const handle = (evt) => {
      if (evt?.notifyUserId && evt.notifyUserId === myId && evt.message) {
        toastInfo(evt.message);
      }
      if (typeof handlerRef.current === "function") handlerRef.current(evt);
    };

    socket.on("PAID_TICKET_EVENT", handle);
    return () => socket.off("PAID_TICKET_EVENT", handle);
  }, []);
}

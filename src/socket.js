import { io } from "socket.io-client";

const socket = io(
  "http://localhost:5000",
  {
    autoConnect: false,
    // Allow polling fallback: websocket-only silently fails behind some
    // proxies / on the first handshake. Socket.IO upgrades to ws when it can.
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  }
);

export default socket;
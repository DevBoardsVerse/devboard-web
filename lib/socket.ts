// lib/socket.ts
// Singleton socket instance — one connection for the entire app lifetime.
// Import `socket` wherever you need to emit or listen.

import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://devboards-api.onrender.com';

// `autoConnect: false` — we connect manually once the user is authenticated
// so we can pass the JWT token at connection time.
export const socket: Socket = io(`${URL}/events`, {
  autoConnect: false,
  transports: ['websocket', 'polling'], // websocket first, polling fallback
  withCredentials: true,
});
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api.ts';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    socket = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Zen Security Real-Time Event Engine');
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from Real-Time Event Engine');
    });
  }

  return socket;
}

export function refreshSocketAuth() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
}

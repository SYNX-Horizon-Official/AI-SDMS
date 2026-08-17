import { io } from 'socket.io-client';

let socket = null;
export default {
  connect: ({ token }) => {
    if (socket) return socket;
    socket = io(import.meta.env.VITE_WS_URL || '/', { auth: { token } });
    return socket;
  }
};

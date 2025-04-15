import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const connectSocket = (token: string) => {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    auth: { token },
    withCredentials: true,
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not connected');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
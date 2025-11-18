import { io } from 'socket.io-client';

export const socket = io({
  path: '/socket.io',
  autoConnect: false, // We connect manually when the user joins/logs in
});
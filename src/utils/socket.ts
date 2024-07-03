import { io } from 'socket.io-client';

//Establishes a socket connection to the server
export const socket = io('http://localhost:3000');

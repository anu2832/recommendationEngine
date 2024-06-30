import { io } from 'socket.io-client';
import { displayUserPortal } from './sockets/authHandler';
import { socket } from '../utils/socket';


socket.on('connect', () => {
    displayUserPortal();
});



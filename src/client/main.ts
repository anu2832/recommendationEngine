// import { io } from 'socket.io-client';
// import { displayUserPortal } from './sockets/authHandler';
// import { socket } from '../utils/socket';

// //Event listener for socket connection
// socket.on('connect', () => {
//     displayUserPortal();
// });

import { socket } from '../utils/socket';
import { UserPortal } from './sockets/auth/userPortal';

// Event listener for socket connection
socket.on('connect', () => {
    UserPortal.display();
});

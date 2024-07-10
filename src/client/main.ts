import { socket } from '../utils/socket';
import { UserPortal } from './sockets/auth/userPortal';

// Event listener for socket connection
socket.on('connect', () => {
    UserPortal.display();
});

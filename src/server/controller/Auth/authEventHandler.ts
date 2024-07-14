import { Socket } from 'socket.io';
import { AuthDatabase } from './authDatabase';
import { getConnection } from '../../../utils/databaseHandler';
import { rl } from '../../../utils/rl';

const userSockets = new Map<string, Socket>();

export class AuthEventHandler {
    private socket: Socket;
    private authDb?: AuthDatabase;

    constructor(socket: Socket) {
        this.socket = socket;
        getConnection()
            .then(connection => {
                this.authDb = new AuthDatabase(connection);
                this.initializeEvents();
            })
            .catch(err => {
                console.error('Error getting connection from pool:', err);
            });
    }

    private initializeEvents() {
        this.socket.on('authenticate', data => this.authenticateUser(data));
        this.socket.on('register', data => this.registerUser(data));
        this.socket.on('user_connected', userId => this.handleUserConnected(userId));
        this.socket.on('logout', () => this.handleLogout());
    }

    private async authenticateUser(data: any) {
        const { employeeId, name } = data;
        try {
            const user = await this.authDb?.authenticateUser(employeeId, name);
            if (user) {
                this.socket.emit('auth_response', {
                    success: true,
                    message: 'Authentication successful',
                    role: user.role,
                    userID: employeeId,
                });
                await this.authDb?.logUserActivity(employeeId, 'login');
            } else {
                this.socket.emit('auth_response', {
                    success: false,
                    message: 'Invalid credentials',
                });
            }
        } catch (err) {
            this.socket.emit('auth_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error:', err);
        }
    }

    private async registerUser(data: any) {
        const { employeeId, name, role } = data;
        try {
            await this.authDb?.registerUser(employeeId, name, role);
            this.socket.emit('register_response', {
                success: true,
                message: 'Registration successful',
                role: role,
            });
        } catch (err) {
            this.socket.emit('register_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error:', err);
        }
    }

    private handleUserConnected(userId: string) {
        console.log(userId); // Log the connected user ID
        userSockets.set(userId, this.socket); // Store user socket in the map
    }

    private async handleLogout() {
        const userId = Array.from(userSockets.entries()).find(
            ([_, sock]) => sock === this.socket,
        )?.[0];
        if (userId) {
            await this.authDb?.logUserActivity(userId, 'logout');
            console.log(`User logged out: ${userId}`);
            userSockets.delete(userId);
            rl.close();
            this.socket.disconnect();
        }
    }
}

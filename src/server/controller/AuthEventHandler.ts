import { Socket } from 'socket.io';
import { getConnection } from '../../utils/databaseHandler';
import { rl } from '../../utils/ReadLineInput';
import { AuthDatabase } from '../databaseHandler/AuthDatabaseHandler';
import { AuthenticationError, DatabaseError } from '../CustomException';
import { User } from '../../models/User';

const userSockets = new Map<string, Socket>();

export class AuthEventHandler {
    private socket: Socket;
    private authDb?: AuthDatabase;

    constructor(socket: Socket) {
        this.socket = socket;
        this.initializeDatabaseConnection();
    }

    private async initializeDatabaseConnection() {
        try {
            const connection = await getConnection();
            this.authDb = new AuthDatabase(connection);
            this.initializeEvents();
        } catch (err) {
            console.error('Error getting connection from pool:', err);
        }
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
                throw new AuthenticationError('Invalid credentials');
            }
        } catch (err) {
            if (err instanceof AuthenticationError) {
                this.socket.emit('auth_response', {
                    success: false,
                    message: err.message,
                });
            } else {
                this.socket.emit('auth_response', {
                    success: false,
                    message: 'Database error',
                });
            }
            console.error('Database query error:', err);
        }
    }

    private async registerUser(data: User) {
        const { employeeId, name, role } = data;
        try {
            await this.authDb?.registerUser(employeeId, name, role);
            this.socket.emit('register_response', {
                success: true,
                message: 'Registration successful',
                role: role,
            });
        } catch (err) {
            if (err instanceof DatabaseError) {
                this.socket.emit('register_response', {
                    success: false,
                    message: 'Database error',
                });
            } else {
                this.socket.emit('register_response', {
                    success: false,
                    message: 'Registration error',
                });
            }
            console.error('Database query error:', err);
        }
    }

    private handleUserConnected(userId: string) {
        userSockets.set(userId, this.socket);
    }

    private async handleLogout() {
        const userId = Array.from(userSockets.entries()).find(([_, sock]) => sock === this.socket)?.[0];
        if (userId) {
            try {
                await this.authDb?.logUserActivity(userId, 'logout');
                console.log(`User logged out: ${userId}`);
                userSockets.delete(userId);
                rl.close();
                this.socket.disconnect();
            } catch (err) {
                console.error('Error logging user activity:', err);
            }
        }
    }
}

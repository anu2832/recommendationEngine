import { Socket } from 'socket.io';
import { pool } from '../../db/db';
import { rl } from '../../utils/rl';
const userSockets = new Map<string, Socket>();

// Handle authentication and user registration events.
export const handleAuthEvents = (socket: Socket) => {
    socket.on('authenticate', async data => {
        const { employeeId, name } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM user WHERE password = ? AND userName = ?',
                [employeeId, name],
            );
            connection.end();

            if ((results as any).length > 0) {
                const user = (results as any)[0];
                socket.emit('auth_response', {
                    success: true,
                    message: 'Authentication successful',
                    role: user.role,
                    userID: employeeId,
                });
                userActivity(employeeId, 'logout');
            } else {
                socket.emit('auth_response', {
                    success: false,
                    message: 'Invalid credentials',
                });
            }
        } catch (err) {
            socket.emit('auth_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    // Event: Register new user
    socket.on('register', async data => {
        const { employeeId, name, role } = data;
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'INSERT INTO user (username, password, role ) VALUES (?, ?, ?)',
                [name, employeeId, role],
            );
            connection.release();
            socket.emit('register_response', {
                success: true,
                message: 'Authentication successful',
                role: role,
            });
        } catch (err) {
            socket.emit('register_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    // Event: Track user connection
    socket.on('user_connected', (userId: string) => {
        console.log(userId);
        userSockets.set(userId, socket);
    });

    // Event: User logout
    socket.on('logout', () => {
        const userId = Array.from(userSockets.entries()).find(
            ([_, sock]) => sock === socket,
        )?.[0];
        if (userId) {
            userActivity(userId, 'logout');
            console.log(`User logged out: ${userId}`);
            userSockets.delete(userId);
            rl.close();
            socket.disconnect();
        }
    });

    // Function to log user activity
    async function userActivity(userId: string, action: string) {
        const dateTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'INSERT INTO userActivityLog (userId, actionType, actionTime) VALUES (?, ?, ?)',
                [userId, action, dateTime],
            );
            connection.release();
            console.log(`Logged action for userId ${userId}: login`);
        } catch (error) {
            console.error('Error logging action:', error);
            throw error;
        }
    }
};

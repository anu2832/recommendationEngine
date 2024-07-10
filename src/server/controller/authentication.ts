import { Socket } from 'socket.io';
import { rl } from '../../utils/rl';
import { pool } from '../../Db/db';
import { RowDataPacket } from 'mysql2';

const userSockets = new Map<string, Socket>();

// Handle authentication and user registration events.
export const handleAuthEvents = (socket: Socket) => {
    socket.on('authenticate', data => authenticateUser(socket, data));

    // Event: Register new user
    socket.on('register', data => registerUser(socket, data));

    // Event: Track user connection
    socket.on('user_connected', userId => handleUserConnected(socket, userId));

    // Event: User logout
    socket.on('logout', () => handleLogout(socket));

    // Function to authenticate user
    async function authenticateUser(socket: Socket, data: any) {
        const { employeeId, name } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM user WHERE password = ? AND userName = ?',
                [employeeId, name],
            );
            connection.release();
            if (results.length > 0) {
                const user = results[0];
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
            console.error('Database query error:', err);
        }
    }

    // Function to register new user
    async function registerUser(socket: Socket, data: any) {
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
                message: 'Registration successful',
                role: role,
            });
        } catch (err) {
            socket.emit('register_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error:', err);
        }
    }

    // Function to handle user connection
    function handleUserConnected(socket: Socket, userId: string) {
        console.log(userId); // Log the connected user ID
        userSockets.set(userId, socket); // Store user socket in the map
    }

    // Function to handle user logout
    function handleLogout(socket: Socket) {
        const userId = Array.from(userSockets.entries()).find(
            ([_, sock]) => sock === socket,
        )?.[0];
        if (userId) {
            userActivity(userId, 'logout'); // Log user logout activity
            console.log(`User logged out: ${userId}`); // Log user logout message
            userSockets.delete(userId); // Remove user socket from the map
            rl.close(); // Close readline interface
            socket.disconnect(); // Disconnect socket
        }
    }

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
            console.log(`Logged action for userId ${userId}: ${action}`);
        } catch (error) {
            console.error('Error logging action:', error);
            throw error;
        }
    }
};

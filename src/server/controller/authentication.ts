// import { Socket } from 'socket.io';
// import { rl } from '../../utils/rl';
// import { pool } from '../../Db/db';
// import { PoolConnection, RowDataPacket } from 'mysql2/promise';
// import { getConnection } from '../../utils/databaseHander';
// const userSockets = new Map<string, Socket>();

// // Handle authentication and user registration events.
// export const handleAuthEvents = (socket: Socket) => {
//     getConnection()
//     .then(connection => {
//     socket.on('authenticate', data => authenticateUser(socket,connection, data));
//     socket.on('register', data => registerUser(socket,connection, data));
//     socket.on('user_connected', userId => handleUserConnected(socket,connection, userId));
//     socket.on('logout', () => handleLogout(socket,connection));
//     })


//     // Function to authenticate user
//     async function authenticateUser(socket: Socket,connection:PoolConnection, data: any) {
//         const { employeeId, name } = data;
//         try {
//             const connection = await pool.getConnection();
//             const [results] = await connection.execute<RowDataPacket[]>(
//                 'SELECT * FROM user WHERE password = ? AND userName = ?',
//                 [employeeId, name],
//             );
//             connection.release();
//             if (results.length > 0) {
//                 const user = results[0];
//                 socket.emit('auth_response', {
//                     success: true,
//                     message: 'Authentication successful',
//                     role: user.role,
//                     userID: employeeId,
//                 });
//                 userActivity(employeeId, 'login');
//             } else {
//                 socket.emit('auth_response', {
//                     success: false,
//                     message: 'Invalid credentials',
//                 });
//             }
//         } catch (err) {
//             socket.emit('auth_response', {
//                 success: false,
//                 message: 'Database error',
//             });
//             console.error('Database query error:', err);
//         }
//     }

//     // Function to register new user
//     async function registerUser(socket: Socket,connection:PoolConnection, data: any) {
//         const { employeeId, name, role } = data;
//         try {
//             const connection = await pool.getConnection();
//             await connection.execute(
//                 'INSERT INTO user (username, password, role ) VALUES (?, ?, ?)',
//                 [name, employeeId, role],
//             );
//             connection.release();
//             socket.emit('register_response', {
//                 success: true,
//                 message: 'Registration successful',
//                 role: role,
//             });
//         } catch (err) {
//             socket.emit('register_response', {
//                 success: false,
//                 message: 'Database error',
//             });
//             console.error('Database query error:', err);
//         }
//     }

//     // Function to handle user connection
//     function handleUserConnected(socket: Socket,connection:PoolConnection, userId: string) {
//         console.log(userId); // Log the connected user ID
//         userSockets.set(userId, socket); // Store user socket in the map
//     }

//     // Function to handle user logout
//     function handleLogout(socket: Socket,connection:PoolConnection,) {
//         const userId = Array.from(userSockets.entries()).find(
//             ([_, sock]) => sock === socket,
//         )?.[0];
//         if (userId) {
//             userActivity(userId, 'logout'); 
//             console.log(`User logged out: ${userId}`); 
//             userSockets.delete(userId); 
//             rl.close(); 
//             socket.disconnect(); 
//         }
//     }

//     // Function to log user activity
//     async function userActivity(userId: string, action: string) {
//         const dateTime = new Date()
//             .toISOString()
//             .slice(0, 19)
//             .replace('T', ' ');
//         try {
//             const connection = await pool.getConnection();
//             await connection.execute(
//                 'INSERT INTO userActivityLog (userId, actionType, actionTime) VALUES (?, ?, ?)',
//                 [userId, action, dateTime],
//             );
//             connection.release();
//             console.log(`Logged action for userId ${userId}: ${action}`);
//         } catch (error) {
//             console.error('Error logging action:', error);
//             throw error;
//         }
//     }
// };

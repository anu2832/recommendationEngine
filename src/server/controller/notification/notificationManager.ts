import dbConnectionManager from './DbConnectionManager';
import { PoolConnection } from 'mysql2/promise';

class NotificationManager {
    // Adding a notification to the database
    async addNotification(message: string) {
        console.log(message);
        let connection: PoolConnection | null = null;
        try {
            const expiryTime = new Date();
            expiryTime.setDate(expiryTime.getDate() + 1);
            connection = await dbConnectionManager.getConnection();
            await connection.execute(
                'INSERT INTO notifications (message, expiryTime) VALUES (?, ?)',
                [message, expiryTime],
            );
            console.log('Notification added:', message);
        } catch (err) {
            console.error('Failed to insert notification:', err);
            throw err;
        } finally {
            if (connection) dbConnectionManager.releaseConnection(connection);
        }
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;

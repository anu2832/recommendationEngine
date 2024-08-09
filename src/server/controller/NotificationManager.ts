import { PoolConnection } from 'mysql2/promise';
import { pool } from '../../dbConfiguration/DbConfiguration';
import { releaseConnection } from '../../utils/databaseHandler';

class NotificationManager {
    async addNotification(message: string) {
        let connection: PoolConnection | null = null;
        try {
            const expiryTime = new Date();
            expiryTime.setDate(expiryTime.getDate() + 1);
            connection = await pool.getConnection();;
            await connection.execute(
                'INSERT INTO notifications (message, expiryTime) VALUES (?, ?)',
                [message, expiryTime],
            );
            console.log('Notification added:', message);
        } catch (err) {
            console.error('Failed to insert notification:', err);
            throw err;
        } finally {
            releaseConnection();
        }
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;

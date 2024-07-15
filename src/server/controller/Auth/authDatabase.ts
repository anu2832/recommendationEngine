import { PoolConnection, RowDataPacket } from 'mysql2/promise';

export class AuthDatabase {
    private connection: PoolConnection;

    constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    async authenticateUser(
        employeeId: string,
        name: string,
    ): Promise<any | null> {
        const [results] = await this.connection.execute<RowDataPacket[]>(
            'SELECT * FROM user WHERE password = ? AND userName = ?',
            [employeeId, name],
        );
        return results.length > 0 ? results[0] : null;
    }

    async registerUser(
        employeeId: string,
        name: string,
        role: string,
    ): Promise<void> {
        await this.connection.execute(
            'INSERT INTO user (username, password, role) VALUES (?, ?, ?)',
            [name, employeeId, role],
        );
    }

    async logUserActivity(userId: string, action: string): Promise<void> {
        const dateTime = new Date()
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
        await this.connection.execute(
            'INSERT INTO userActivityLog (userId, actionType, actionTime) VALUES (?, ?, ?)',
            [userId, action, dateTime],
        );
    }
}

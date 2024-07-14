import { pool } from '../../../Db/db';
import { PoolConnection } from 'mysql2/promise';

export class DbConnectionManager {
    private pool: any;

    constructor(pool: any) {
        this.pool = pool;
    }

    async getConnection(): Promise<PoolConnection> {
        return await this.pool.getConnection();
    }

    releaseConnection(connection: PoolConnection) {
        connection.release();
    }
}

const dbConnectionManager = new DbConnectionManager(pool);
export default dbConnectionManager;

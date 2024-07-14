import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

export class Database {

    public async checkItemExists(connection: PoolConnection, itemId: string): Promise<boolean> {
        const [results]: any = await connection.execute(
            'SELECT COUNT(*) as count FROM menuitem WHERE itemId = ?',
            [itemId],
        );
        return results[0].count > 0;
    }

    public async getDiscardItemList(connection: PoolConnection, id: string): Promise<any> {
        const [discardResults] = await connection.execute(
            'SELECT * FROM discardItemList WHERE itemId = ?',
            [id],
        );
        return discardResults;
    }

    public async deleteFromDiscardItemList(connection: PoolConnection, id: string): Promise<void> {
        await connection.execute(
            'DELETE FROM discardItemList WHERE itemId = ?',
            [id],
        );
    }

    public async deleteFromMenuItem(connection: PoolConnection, id: string): Promise<void> {
        await connection.execute(
            'DELETE FROM menuitem WHERE itemId = ?',
            [id],
        );
    }

    public async getRolloverItems(connection: PoolConnection, currentDate: string, menuType: string): Promise<any> {
        const [rolloutResults] = await connection.execute(
            `SELECT r.*, m.diet_category, m.spice_level, m.area, m.sweet_level, m.mealType
             FROM rollover r
             JOIN menuitem m ON r.itemId = m.itemId
             WHERE DATE(r.rolloverCreationTime) = ? AND m.mealType = ?`,
            [currentDate, menuType],
        );
        return rolloutResults;
    }

    public async getMaxVotedItem(connection: PoolConnection): Promise<any> {
        const [maxVoteItem] = await connection.execute(
            'SELECT r.*, m.mealType FROM rollover r JOIN menuitem m ON r.itemId = m.itemId ORDER BY r.vote DESC LIMIT 1',
        );
        return maxVoteItem;
    }

    public async getFinalizedMenuItems(connection: PoolConnection, itemId: string, currentDate: string): Promise<any> {
        const [existingFinalMenuItems] = await connection.execute(
            'SELECT * FROM finalizedMenu WHERE itemId = ? AND preparedOn = ?',
            [itemId, currentDate],
        );
        return existingFinalMenuItems;
    }

    public async insertIntoFinalizedMenu(connection: PoolConnection, itemId: string, itemName: string, currentDate: string): Promise<void> {
        await connection.execute(
            'INSERT INTO finalizedMenu (itemId, itemName, preparedOn) VALUES (?, ?, ?)',
            [itemId, itemName, currentDate],
        );
    }

    public async insertIntoDiscardItemList(connection: PoolConnection, discardItemId: number, itemId: string, dateTime: string): Promise<void> {
        await connection.execute(
            'INSERT INTO discardItemlist (discardItemId, itemId, Date) VALUES (?, ?, ?)',
            [discardItemId, itemId, dateTime],
        );
    }

    public async getMenuItems(connection: PoolConnection): Promise<any> {
        const [results] = await connection.execute('SELECT * FROM menuItem');
        return results;
    }

    public async getFeedbackItems(connection: PoolConnection): Promise<any> {
        const [results] = await connection.execute('SELECT * FROM feedBack');
        return results;
    }

    public async getLatestDiscardedItem(connection: PoolConnection): Promise<any> {
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM discardItemList ORDER BY date DESC LIMIT 1',
        );
        return rows.length > 0 ? rows[0] : null;
    }
}

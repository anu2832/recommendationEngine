// src/handlers/employeeDatabase.ts
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../dbConfiguration/DbConfiguration';

export async function getUserProfile(userId: string): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM userInformation WHERE userId = ?',
        [userId],
    );
    return rows;
}

export async function updateUserProfile(
    userId: string,
    diet_category: string,
    spice_level: string,
    area: string,
    sweet_level: string,
) {
    const connection = await pool.getConnection();
    await connection.query(
        'UPDATE userInformation SET diet_category = ?, spice_level = ?, sweet_level = ?, area = ? WHERE userId = ?',
        [diet_category, spice_level, sweet_level, area, userId],
    );
    connection.release();
}

export async function insertUserProfile(
    userId: string,
    diet_category: string,
    spice_level: string,
    area: string,
    sweet_level: string,
) {
    const connection = await pool.getConnection();
    await connection.query(
        'INSERT INTO userInformation (userId, diet_category, spice_level, area, sweet_level) VALUES (?, ?, ?, ?, ?)',
        [userId, diet_category, spice_level, area, sweet_level],
    );
    connection.release();
}

export async function getMenuItems(): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM menuitem',
    );
    return results;
}

export async function getFeedbacks(): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM feedBack',
    );
    return results;
}

export async function getRolloutItems(): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
        `SELECT r.*, m.diet_category, m.spice_level, m.area, m.sweet_level
         FROM rollover r
         JOIN menuitem m ON r.itemId = m.itemId`,
    );
    return results;
}

export async function incrementVote(itemId: string) {
    const connection = await pool.getConnection();
    await connection.execute(
        'UPDATE rollover SET vote = vote + 1 WHERE itemId = ?',
        [itemId],
    );
    connection.release();
}

export async function insertVotedUser(userId: string, itemId: string) {
    const connection = await pool.getConnection();
    await connection.execute(
        'INSERT INTO votedUsers (userId, itemId) VALUES (?, ?)',
        [userId, itemId],
    );
    connection.release();
}

export async function getVotedUser(userId: string): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [userVotes] = await connection.execute<RowDataPacket[]>(
        'SELECT userId FROM votedUsers WHERE userId = ?',
        [userId],
    );
    return userVotes;
}

export async function insertFeedback(
    id: string,
    itemId: string,
    userName: string,
    itemName: string,
    message: string,
    rating: number,
    mealType: string,
) {
    const connection = await pool.getConnection();
    await connection.execute(
        'INSERT INTO feedBack (id, itemId, userName, itemName, message, rating, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, itemId, userName, itemName, message, rating, mealType],
    );
    connection.release();
}

export async function getFinalizedMenu(
    currentDate: string,
): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM finalizedMenu WHERE preparedOn = ?',
        [currentDate],
    );
    connection.release();
    return results;
}

export async function getNotifications(sinceNotificationId?: number) {
    console.log(sinceNotificationId,"with last notification id")
    const connection = await pool.getConnection();
    try {
        if (sinceNotificationId) {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications WHERE notificationId > ? ORDER BY createdAt DESC',
                [sinceNotificationId],
            );
            console.log(results,"with last notification id")
            return results;
        } else {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications ORDER BY createdAt DESC',
            );
            return results;
        }
    } finally {
        connection.release();
    }
}

export async function insertRecipe(
    itemName: string,
    userName: string,
    ingredients: string,
    procedure: string,
) {
    const connection = await pool.getConnection();
    await connection.execute(
        'INSERT INTO selfSubmittedRecipe (itemName, userName, ingredients, procedure) VALUES (?, ?, ?, ?)',
        [itemName, userName, ingredients, procedure],
    );
    connection.release();
}

export async function getDiscardedItems(
    userId: string,
): Promise<RowDataPacket[]> {
    const connection = await pool.getConnection();
    const [results] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM discardItemList ORDER BY itemId DESC',
    );

    connection.release();
    return results;
}

import { Socket } from 'socket.io';
import { pool } from '../../db/db';
import { RowDataPacket } from 'mysql2/promise';
import { getTopFoodItems } from '../../recomendation';
import { addNotification } from './addNotification';

// Handle events related to chef actions
export const handleChefEvents = (socket: Socket) => {
    socket.on('check_item_exists', async ({ itemId }) => {
        try {
            const connection = await pool.getConnection();
            const [results]: any = await connection.execute(
                'SELECT COUNT(*) as count FROM menuitem WHERE itemId = ?',
                [itemId],
            );
            connection.release();

            const exists = results[0].count > 0;
            socket.emit('check_item_exists_response', {
                success: true,
                exists,
            });
        } catch (err) {
            socket.emit('check_item_exists_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    // Event: Create a rollout with top food items based on menu type
    socket.on('create_rollout', async data => {
        try {
            const top5FoodItems = await getTopFoodItems(data.menuType);
            await addNotification('New item added: ' + data.name);
            socket.emit('create_rollout_response', {
                success: true,
                message: 'Rolled out menu',
                rolledOutMenu: top5FoodItems,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
        }
    });

    socket.on('selectedMenu', async data => {
        try {
            const connection = await pool.getConnection();
            const [maxVoteItem] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM rollover ORDER BY vote DESC LIMIT 1',
            );
            if (maxVoteItem.length > 0) {
                const { itemId, itemName } = maxVoteItem[0];
                const currentDate = new Date().toISOString().slice(0, 10);
                await connection.execute(
                    'INSERT INTO finalizedMenu (itemId, itemName, preparedOn) VALUES (?, ?, ?)',
                    [itemId, itemName, currentDate],
                );
                console.log(
                    `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
                );
                await addNotification(
                    'FinalMenu item: ' +
                        itemName +
                        ' with ID ' +
                        itemId +
                        ' added to final_menu for date ' +
                        currentDate,
                );
            } else {
                console.log('No items found in rollover table.');
            }
            connection.release();
        } catch (error) {
            console.error('Error finalizing menu:', error);
        }
    });
    socket.on('discardItemList', async data => {
        try {
            const canProceed = await canPerformOperation();
            const lowerItem: any = await getTopFoodItems();
            console.log(lowerItem);
            if (!canProceed) {
                console.log(
                    'You can only generate a discard list once a month.',
                );
                return;
            }
            const dateTime = new Date()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
            await pool.execute(
                'INSERT INTO discardItemList (discardItemId, itemId, date) VALUES (?, ?, ?)',
                [0, lowerItem[0].foodId, dateTime],
            );
            socket.emit('discard_response', {
                success: true,
                message: 'Rolled out menu',
                lowerItem: lowerItem,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
        }
    });

    socket.on('create_rollout', async data => {
        try {
            const top5FoodItems = await getTopFoodItems(data.menuType);
            await addNotification('New item added: ' + data.name);
            socket.emit('create_rollout_response', {
                success: true,
                message: 'Rolled out menu',
                rolledOutMenu: top5FoodItems,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
        }
    });
};

export async function getLatestDiscardedItem(): Promise<any> {
    console.log('hiii');
    const connection = await pool.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM discardItemList ORDER BY date DESC LIMIT 1',
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function canPerformOperation(): Promise<boolean> {
    const lastDiscardedItem = await getLatestDiscardedItem();
    if (lastDiscardedItem) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const discardedAt = new Date(lastDiscardedItem.discardedAt);
        if (discardedAt > oneMonthAgo) {
            return false;
        }
    }
    return true;
}

import { Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2/promise';
import { addNotification } from './addNotification';
import { getTopFoodItems } from '../../Recomendation';
import { pool } from '../../Db/db';

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
            const connection = await pool.getConnection();
            const [rolloutResults] = await connection.execute<RowDataPacket[]>(
                `SELECT r.*,
                 m.diet_category,
                 m.spice_level,
                 m.area,
                 m.sweet_level
                FROM rollover r
                JOIN menuitem m ON r.itemId = m.itemId;`
            );
            const top5FoodItems = await getTopFoodItems(data.menuType);
            await addNotification('New item added: ' + data.name);
            socket.emit('create_rollout_response', {
                success: true,
                message: 'RollOut Menu : ',
                rolloutMenu: rolloutResults,
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

    // socket.on('discardItemList', async data => {
    //     try {
    //         const canProceed = await canPerformOperation();
    //         const lowerItem: any = await getTopFoodItems();
    //         console.log(lowerItem);
    //         if (!canProceed) {
    //             console.log(
    //                 'You can only generate a discard list once a month.',
    //             );
    //             return;
    //         }
    //         const dateTime = new Date()
    //             .toISOString()
    //             .slice(0, 19)
    //             .replace('T', ' ');
    //         await pool.execute(
    //             'INSERT INTO discardItemList (discardItemId, itemId, date) VALUES (?, ?, ?)',
    //             [0, lowerItem[0].foodId, dateTime],
    //         );
    //         socket.emit('discard_response', {
    //             success: true,
    //             message: 'Rolled out menu',
    //             lowerItem: lowerItem,
    //         });
    //     } catch (error) {
    //         console.error('Error fetching top 5 food items:', error);
    //     }
    // });

    socket.on('discardItemList', async data => {
        try {
            const canProceed = await canPerformOperation();
            let lowerItem = await getTopFoodItems();
 
            if (!canProceed) {
                console.log('You can only generate a discard list once a month.');
                socket.emit('discard_response', {
                    success: false,
                    message: 'You can only generate a discard list once a month.',
                });
                return;
            }
 
            lowerItem = lowerItem.filter(item => item.averageRating < 2);
 
            if (lowerItem.length === 0) {
                console.log('No items with an average rating less than 2 found.');
                socket.emit('discard_response', {
                    success: false,
                    message: 'No items with an average rating less than 2 found.',
                });
                return;
            }
 
            const dateTime = new Date()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
 
            for (const item of lowerItem) {
                await pool.execute(
                    'INSERT INTO discardItemlist (discardItemId, itemId, Date) VALUES (?, ?, ?)',
                    [0, item.foodId, dateTime],
                );
                await pool.execute('DELETE FROM menuitem WHERE itemId = ?', [item.foodId]);
            }
 
            console.log('Discard list generated successfully.');
            socket.emit('discard_response', {
                success: true,
                message: 'Discard list generated successfully.',
                discardItems:lowerItem
            });
        } catch (error) {
            console.error('Error in discard list making:', error);
            socket.emit('discard_response', {
                success: false,
                message: 'Error in discard list making.',
            });
        }
    });

    socket.on('see_menu', async () => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM menuItem',
            );
            connection.release();
            socket.emit('see_menu_response', { success: true, menu: results });
        } catch (err) {
            socket.emit('see_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
 
    socket.on('see_feedback', async () => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM feedBack',
            );
            console.log("results--->",results)
            connection.release();
 
            socket.emit('see_feedback_response', {
                success: true,
                itemFeedback: results,
            });
        } catch (err) {
            socket.emit('see_feedback_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};

export async function canPerformOperation(): Promise<boolean> {
    const lastDiscardedItem = await getLatestDiscardedItem();
    console.log(lastDiscardedItem,"--------->")
    if (lastDiscardedItem) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const discardedAt = new Date(lastDiscardedItem.date);
        if (discardedAt > oneMonthAgo) {
            return false;
        }
    }
    return true;
}

export async function getLatestDiscardedItem(): Promise<any> {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM discardItemList ORDER BY date DESC LIMIT 1',
    );
    return rows.length > 0 ? rows[0] : null;
}

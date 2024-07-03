import { Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2/promise';
import { addNotification } from './addNotification';
import { getTopFoodItems } from '../../Recomendation';
import { pool } from '../../Db/db';

// Handle events related to chef actions
export const handleChefEvents = (socket: Socket) => {
    socket.on('check_item_exists', async ({ itemId }) => {
        await checkItemExists(socket, itemId);
    });

    socket.on('create_rollout', async data => {
        await createRollout(socket, data);
    });

    socket.on('selectedMenu', async data => {
        await selectMenu(socket, data);
    });

    socket.on('discardItemList', async data => {
        await generateDiscardList(socket, data);
    });

    socket.on('see_menu', async () => {
        await viewMenu(socket);
    });

    socket.on('see_feedback', async () => {
        await viewFeedback(socket);
    });
};

// Function to check if a menu item exists
async function checkItemExists(socket: Socket, itemId: string) {
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
}

// Function to create a rollout with top food items based on menu type
async function createRollout(socket: Socket, data: any) {
    try {
        const connection = await pool.getConnection();
        const currentDate = new Date().toISOString().slice(0, 10);
        const [rolloutResults] = await connection.execute<RowDataPacket[]>(
            `SELECT r.*,
                m.diet_category,
                m.spice_level,
                m.area,
                m.sweet_level,
                m.mealType
             FROM rollover r
             JOIN menuitem m ON r.itemId = m.itemId
             WHERE DATE(r.rolloverCreationTime) = ? AND m.mealType = ?`,
            [currentDate, data.menuType],
        );

        if (rolloutResults.length > 0) {
            console.log(
                `RollOut menu is already created for ${data.menuType}`,
            );
            socket.emit('get_recommendation_response', {
                success: false,
                message: `RollOut menu is already created for ${data.menuType}`,
                rolloutMenu: rolloutResults,
            });
            return;
        } else {
            const top5FoodItems = await getTopFoodItems(data.menuType);
            await addNotification("Rollover is done.");
        }

        socket.emit('create_rollout_response', {
            success: true,
            message: `New RollOut Menu created for  ${data.menuType}`,
            rolloutMenu: rolloutResults,
        });
    } catch (error) {
        console.error('Error fetching top 5 food items:', error);
        socket.emit('create_rollout_response', {
            success: false,
            message: 'Error fetching top 5 food items.',
        });
    }
}

// Function to select the top voted menu item and add it to the finalized menu
async function selectMenu(socket: Socket, data: any) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [maxVoteItem] = await connection.execute<RowDataPacket[]>(
            'SELECT r.*, m.mealType FROM rollover r JOIN menuitem m ON r.itemId = m.itemId ORDER BY r.vote DESC LIMIT 1',
        );
        console.log(maxVoteItem[0]);

        if (maxVoteItem.length > 0) {
            const { itemId, itemName, mealType } = maxVoteItem[0];
            const currentDate = new Date().toISOString().slice(0, 10);
            const [existingFinalMenuItems] = await connection.execute<
                RowDataPacket[]
            >(
                'SELECT * FROM finalizedMenu WHERE itemId = ? AND preparedOn = ?',
                [itemId, currentDate],
            );

            if (existingFinalMenuItems.length > 0) {
                console.log(
                    `Item has already been added to the final_menu for '${mealType}' for today.`,
                );
                socket.emit('finalizedMenu_response', {
                    success: false,
                    message: `Item has already been added to the final_menu for '${mealType}' for today.`,
                });
                connection.release();
                return;
            }

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

            socket.emit('finalizedMenu_response', {
                success: true,
                message: `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
            });
        } else {
            console.log('No items found in rollover table.');
            socket.emit('finalizedMenu_response', {
                success: false,
                message: 'No items found in rollover table.',
            });
        }

        connection.release();
    } catch (error) {
        if (connection) connection.release();

        console.error('Error finalizing menu:', error);
        socket.emit('finalizedMenu_response', {
            success: false,
            message: 'Error finalizing menu.',
        });
    }
}

// Function to generate a discard list for items with average rating less than 2
async function generateDiscardList(socket: Socket, data: any) {
    try {
        const canProceed = await canPerformOperation();
        let lowerItem = await getTopFoodItems();

        if (!canProceed) {
            console.log(
                'You can only generate a discard list once a month.',
            );
            socket.emit('discard_response', {
                success: false,
                message:
                    'You can only generate a discard list once a month.',
            });
            return;
        }

        lowerItem = lowerItem.filter(item => item.averageRating < 2);

        if (lowerItem.length === 0) {
            console.log(
                'No items with an average rating less than 2 found.',
            );
            socket.emit('discard_response', {
                success: false,
                message:
                    'No items with an average rating less than 2 found.',
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
            await pool.execute('DELETE FROM menuitem WHERE itemId = ?', [
                item.foodId,
            ]);
        }

        console.log('Discard list generated successfully.');
        socket.emit('discard_response', {
            success: true,
            message: 'Discard list generated successfully.',
            discardItems: lowerItem,
        });
    } catch (error) {
        console.error('Error in discard list making:', error);
        socket.emit('discard_response', {
            success: false,
            message: 'Error in discard list making.',
        });
    }
}

// Function to view the current menu
async function viewMenu(socket: Socket) {
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
}

// Function to view the feedback of menu items
async function viewFeedback(socket: Socket) {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(
            'SELECT * FROM feedBack',
        );
        console.log('results--->', results);
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
}

// Check if a discard operation can be performed
export async function canPerformOperation(): Promise<boolean> {
    const lastDiscardedItem = await getLatestDiscardedItem();
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

// Get the latest discarded item
export async function getLatestDiscardedItem(): Promise<any> {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM discardItemList ORDER BY date DESC LIMIT 1',
    );
    return rows.length > 0 ? rows[0] : null;
}

// import { Socket } from 'socket.io';
// import { RowDataPacket, PoolConnection } from 'mysql2/promise';
// import { getTopFoodItems } from '../../Recomendation';
// import { pool } from '../../Db/db';
// import notificationManager from './notification/notificationManager';

// // Handle events related to chef actions
// export const handleChefEvents = (socket: Socket) => {
//     getConnection()
//         .then(connection => {
//             socket.on('check_item_exists', async ({ itemId }) => {
//                 await checkItemExists(socket, connection, itemId);
//             });

//             socket.on('create_rollout', async data => {
//                 await createRollout(socket, connection, data);
//             });

//             socket.on('selectedMenu', async data => {
//                 await selectMenu(socket, connection, data);
//             });

//             socket.on('allDiscardedItems', async data => {
//                 await createDiscardList(socket, connection, data);
//             });

//             socket.on('modifyDiscardList', async data => {
//                 await modifyDiscardList(socket, connection, data);
//             });

//             socket.on('see_menu', async () => {
//                 await viewMenu(socket, connection);
//             });

//             socket.on('see_feedback', async () => {
//                 await viewFeedback(socket, connection);
//             });

//             socket.on('disconnect', () => {
//                 connection.release();
//             });
//         })
//         .catch(err => {
//             console.error('Error getting connection from pool:', err);
//         });
// };

// // Function to get a connection from the pool
// const getConnection = async () => {
//     return await pool.getConnection();
// };

// // Function to check if a menu item exists
// async function checkItemExists(socket: Socket, connection: PoolConnection, itemId: string) {
//     try {
//         const [results]: any = await connection.execute(
//             'SELECT COUNT(*) as count FROM menuitem WHERE itemId = ?',
//             [itemId],
//         );

//         const exists = results[0].count > 0;
//         socket.emit('check_item_exists_response', {
//             success: true,
//             exists,
//         });
//     } catch (err) {
//         socket.emit('check_item_exists_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error', err);
//     }
// }

// // Function to modify discard list
// async function modifyDiscardList(socket: Socket, connection: PoolConnection, data: any) {
//     const { choice, id } = data;
//     try {
//         const [discardResults] = await connection.execute<RowDataPacket[]>(
//             'SELECT * FROM discardItemList WHERE itemId = ?',
//             [id],
//         );

//         if (discardResults.length === 0) {
//             socket.emit('modify_discard_list_response', {
//                 success: false,
//                 message: 'Item not found in discard list.',
//             });
//             return;
//         }

//         if (choice === 'menu') {
//             await connection.beginTransaction();

//             await connection.execute(
//                 'DELETE FROM discardItemList WHERE itemId = ?',
//                 [id],
//             );

//             await connection.execute('DELETE FROM menuitem WHERE itemId = ?', [id]);

//             await connection.commit();

//             socket.emit('modify_discard_list_response', {
//                 success: true,
//                 message: 'Item successfully deleted from menu and discard list.',
//             });
//         } else if (choice === 'discard') {
//             await connection.execute(
//                 'DELETE FROM discardItemList WHERE itemId = ?',
//                 [id],
//             );

//             socket.emit('modify_discard_list_response', {
//                 success: true,
//                 message: 'Item successfully deleted from discard list.',
//             });
//         } else {
//             socket.emit('modify_discard_list_response', {
//                 success: false,
//                 message: 'Invalid choice.',
//             });
//         }
//     } catch (error) {
//         console.error('Error modifying item:', error);

//         socket.emit('modify_discard_list_response', {
//             success: false,
//             message: 'Failed to modify item.',
//         });
//     }
// }

// // Function to create a rollout with top food items based on menu type
// async function createRollout(socket: Socket, connection: PoolConnection, data: any) {
//     try {
//         const currentDate = new Date().toISOString().slice(0, 10);
//         const [rolloutResults] = await connection.execute<RowDataPacket[]>(
//             `SELECT r.*,
//                 m.diet_category,
//                 m.spice_level,
//                 m.area,
//                 m.sweet_level,
//                 m.mealType
//              FROM rollover r
//              JOIN menuitem m ON r.itemId = m.itemId
//              WHERE DATE(r.rolloverCreationTime) = ? AND m.mealType = ?`,
//             [currentDate, data.menuType],
//         );

//         console.log(rolloutResults, '----------');

//         if (rolloutResults.length > 0) {
//             console.log(`RollOut menu is already created for ${data.menuType}`);
//             socket.emit('get_recommendation_response', {
//                 success: false,
//                 message: `RollOut menu is already created for ${data.menuType}`,
//                 rolloutMenu: rolloutResults,
//             });
//             return;
//         } else {
//             const top5FoodItems = await getTopFoodItems(data.menuType);
//             await notificationManager.addNotification('Rollover is done.');
//         }

//         socket.emit('create_rollout_response', {
//             success: true,
//             message: `New RollOut Menu created for  ${data.menuType}`,
//             rolloutMenu: rolloutResults,
//         });
//     } catch (error) {
//         console.error('Error fetching top 5 food items:', error);
//         socket.emit('create_rollout_response', {
//             success: false,
//             message: 'Error fetching top 5 food items.',
//         });
//     }
// }

// // Function to select the top voted menu item and add it to the finalized menu
// async function selectMenu(socket: Socket, connection: PoolConnection, data: any) {
//     try {
//         const [maxVoteItem] = await connection.execute<RowDataPacket[]>(
//             'SELECT r.*, m.mealType FROM rollover r JOIN menuitem m ON r.itemId = m.itemId ORDER BY r.vote DESC LIMIT 1',
//         );
//         console.log(maxVoteItem[0]);

//         if (maxVoteItem.length > 0) {
//             const { itemId, itemName, mealType } = maxVoteItem[0];
//             const currentDate = new Date().toISOString().slice(0, 10);
//             const [existingFinalMenuItems] = await connection.execute<RowDataPacket[]>(
//                 'SELECT * FROM finalizedMenu WHERE itemId = ? AND preparedOn = ?',
//                 [itemId, currentDate],
//             );

//             if (existingFinalMenuItems.length > 0) {
//                 console.log(
//                     `Item has already been added to the final_menu for '${mealType}' for today.`,
//                 );
//                 socket.emit('finalizedMenu_response', {
//                     success: false,
//                     message: `Item has already been added to the final_menu for '${mealType}' for today.`,
//                 });
//                 return;
//             }

//             await connection.execute(
//                 'INSERT INTO finalizedMenu (itemId, itemName, preparedOn) VALUES (?, ?, ?)',
//                 [itemId, itemName, currentDate],
//             );

//             console.log(
//                 `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
//             );

//             await notificationManager.addNotification(
//                 'FinalMenu item: ' +
//                     itemName +
//                     ' with ID ' +
//                     itemId +
//                     ' added to final_menu for date ' +
//                     currentDate,
//             );

//             socket.emit('finalizedMenu_response', {
//                 success: true,
//                 message: `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
//             });
//         } else {
//             console.log('No items found in rollover table.');
//             socket.emit('finalizedMenu_response', {
//                 success: false,
//                 message: 'No items found in rollover table.',
//             });
//         }
//     } catch (error) {
//         console.error('Error finalizing menu:', error);
//         socket.emit('finalizedMenu_response', {
//             success: false,
//             message: 'Error finalizing menu.',
//         });
//     }
// }

// // Function to generate a discard list for items with average rating less than 2
// async function createDiscardList(socket: Socket, connection: PoolConnection, data: any) {
//     try {
//         const canProceed = await canPerformOperation(connection);
//         let lowerItem = await getTopFoodItems();

//         if (!canProceed) {
//             console.log('You can only generate a discard list once a month.');
//             socket.emit('discard_response_chef', {
//                 success: false,
//                 message: 'You can only generate a discard list once a month.',
//             });
//             return;
//         }

//         lowerItem = lowerItem.filter(item => item.averageRating < 2);

//         if (lowerItem.length === 0) {
//             console.log('No items with an average rating less than 2 found.');
//             socket.emit('discard_response_chef', {
//                 success: false,
//                 message: 'No items with an average rating less than 2 found.',
//             });
//             return;
//         }

//         const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

//         for (const item of lowerItem) {
//             await connection.execute(
//                 'INSERT INTO discardItemlist (discardItemId, itemId, Date) VALUES (?, ?, ?)',
//                 [0, item.foodId, dateTime],
//             );
//             await connection.execute('DELETE FROM menuitem WHERE itemId = ?', [
//                 item.foodId,
//             ]);
//         }

//         console.log('Discard list generated successfully.');
//         socket.emit('discard_response_chef', {
//             success: true,
//             message: 'Discard list generated successfully.',
//             discardItems: lowerItem,
//         });
//     } catch (error) {
//         console.error('Error in discard list making:', error);
//         socket.emit('discard_response_chef', {
//             success: false,
//             message: 'Error in discard list making.',
//         });
//     }
// }

// // Function to view the current menu
// async function viewMenu(socket: Socket, connection: PoolConnection) {
//     try {
//         const [results] = await connection.execute('SELECT * FROM menuItem');
//         socket.emit('see_menu_response', { success: true, menu: results });
//     } catch (err) {
//         socket.emit('see_menu_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error', err);
//     }
// }

// // Function to view the feedback of menu items
// async function viewFeedback(socket: Socket, connection: PoolConnection) {
//     try {
//         const [results] = await connection.execute('SELECT * FROM feedBack');
//         console.log('results--->', results);

//         socket.emit('see_feedback_response', {
//             success: true,
//             itemFeedback: results,
//         });
//     } catch (err) {
//         socket.emit('see_feedback_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error', err);
//     }
// }

// // Check if a discard operation can be performed
// export async function canPerformOperation(connection: PoolConnection): Promise<boolean> {
//     const lastDiscardedItem = await getLatestDiscardedItem(connection);
//     if (lastDiscardedItem) {
//         if (isWithinLast30Days(lastDiscardedItem.date)) {
//             return false;
//         }
//     }
//     return true;
// }

// function isWithinLast30Days(date: string | Date): boolean {
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
//     const discardedAt = new Date(date);
//     return discardedAt > oneMonthAgo;
// }

// // Get the latest discarded item
// export async function getLatestDiscardedItem(connection: PoolConnection): Promise<any> {
//     const [rows] = await connection.execute<RowDataPacket[]>(
//         'SELECT * FROM discardItemList ORDER BY date DESC LIMIT 1',
//     );
//     return rows.length > 0 ? rows[0] : null;
// }

// import { Socket } from 'socket.io';
// import { MenuItem } from '../../models/menuItem';
// import { PoolConnection, RowDataPacket } from 'mysql2/promise';
// import { getConnection } from '../../utils/databaseHander';
// import notificationManager from './notification/notificationManager';

// // Handle admin-specific socket events
// export const handleAdminEvents = (socket: Socket) => {
//     getConnection()
//         .then(connection => {
//             socket.on('add_item', async (data: MenuItem) => await addItem(socket, connection, data));
//             socket.on('delete_item', async (data: any) => await deleteItem(socket, connection, data));
//             socket.on('update_item', async ({ itemId, availability }) => await updateItem(socket, connection, itemId, availability));
//         })
//         .catch(err => {
//             console.error('Error getting connection from pool:', err);
//         });
// };

// async function addItem(socket: Socket, connection: PoolConnection, data: MenuItem) {
//     try {
//         const [results] = await connection.execute(
//             'INSERT INTO menuitem (itemId, itemName, price, mealType, availability, diet_category, spice_level, sweet_level, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [
//                 data.id,
//                 data.name,
//                 data.price,
//                 data.mealTime,
//                 data.availability,
//                 data.diet_category,
//                 data.spice_level,
//                 data.sweetDish,
//                 data.area,
//             ]
//         );
//         connection.release();
//         socket.emit('add_item_response', {
//             success: true,
//             message: 'Item added successfully',
//         });
//         await notificationManager.addNotification('New item added: ' + data.name);
//        // await addNotification('New item added: ' + data.name);
//     } catch (err) {
//         socket.emit('add_item_response', {
//             success: false,
//             message: err,
//         });
//         console.error('Database query error:', err);
//     }
// }

// async function deleteItem(socket: Socket, connection: PoolConnection, data: any) {
//     const { itemId } = data;
//     try {
//         const [results] = await connection.execute(
//             'DELETE FROM menuItem WHERE itemId = ?',
//             [itemId]
//         );
//         connection.release();

//         if ((results as any).affectedRows > 0) {
//             socket.emit('delete_item_response', {
//                 success: true,
//                 message: 'Item deleted successfully',
//             });
//         } else {
//             socket.emit('delete_item_response', {
//                 success: false,
//                 message: 'Item not found',
//             });
//         }
//     } catch (err) {
//         socket.emit('delete_item_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error:', err);
//     }
// }

// async function updateItem(socket: Socket, connection: PoolConnection, itemId: string, availability: boolean) {
//     try {
//         const [existingItems] = await connection.execute<RowDataPacket[]>(
//             'SELECT * FROM menuitem WHERE itemId = ?',
//             [itemId]
//         );
//         if (existingItems.length === 0) {
//             connection.release();
//             socket.emit('update_item_response', {
//                 success: false,
//                 message: 'Item not found',
//             });
//             return;
//         }
//         await connection.execute(
//             'UPDATE menuitem SET availability = ? WHERE itemId = ?',
//             [availability, itemId]
//         );
//         connection.release();
//         socket.emit('update_item_response', { success: true });
//         await notificationManager.addNotification('Item availability updated: ' + itemId);
//        // await addNotification('Item availability updated: ' + itemId);
//     } catch (err) {
//         socket.emit('update_item_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error:', err);
//     }
// }

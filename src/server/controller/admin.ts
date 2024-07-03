import { Socket } from 'socket.io';
import { MenuItem } from '../../models/menuItem';
import { addNotification } from './addNotification';
import { pool } from '../../Db/db';
import { RowDataPacket } from 'mysql2';

// Handle admin-specific socket events
export const handleAdminEvents = (socket: Socket) => {
    socket.on('add_item', async (data: MenuItem) => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'INSERT INTO menuitem (itemId, itemName, price,  mealType, availability, diet_category, spice_level, sweet_level, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    data.id,
                    data.name,
                    data.price,
                    data.availability,
                    data.mealTime,
                    data.diet_category,
                    data.spice_level,
                    data.area,
                    data.sweetDish,
                ],
            );
            connection.release();
            socket.emit('add_item_response', {
                success: true,
                message: 'Item added successfully',
            });
            await addNotification('New item added: ' + data.name);
        } catch (err) {
            socket.emit('add_item_response', {
                success: false,
                message: err,
            });
            console.error('Database query error:-', err);
        }
    });

    //Event listener for deleting a menu item
    socket.on('delete_item', async data => {
        const { itemId, role } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'DELETE FROM menuItem WHERE itemId = ?',
                [itemId],
            );
            connection.release();

            if ((results as any).affectedRows > 0) {
                socket.emit('delete_item_response', {
                    success: true,
                    message: 'Item deleted successfully',
                });
            } else {
                socket.emit('delete_item_response', {
                    success: false,
                    message: 'Item not found',
                });
            }
        } catch (err) {
            socket.emit('delete_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    //Event listener for updating availability of menu item
    socket.on('update_item', async ({ itemId, availability }) => {
        try {
            console.log('availability', availability, itemId);
            const connection = await pool.getConnection();
            const [existingItems] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM menuitem WHERE itemId = ?',
                [itemId],
            );
            if (existingItems.length === 0) {
                connection.release();
                socket.emit('update_item_response', {
                    success: false,
                    message: 'Item not found',
                });
                return;
            }
            await connection.execute(
                'UPDATE menuitem SET availability = ? WHERE itemId = ?',
                [availability, itemId],
            );
            connection.release();
            socket.emit('update_item_response', { success: true });
            await addNotification('Item availability updated: ' + itemId);
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};

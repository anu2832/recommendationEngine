import { Socket } from 'socket.io';
import { pool } from '../../db/db';
import { MenuItem } from '../../models/menuItem';
import { addNotification } from './addNotification';

// Handle admin-specific socket events
export const handleAdminEvents = (socket: Socket) => {
    socket.on('add_item', async (data: MenuItem) => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'INSERT INTO menuitem (itemId, itemName, price,  mealType, availability) VALUES (?, ?, ?, ?, ?)',
                [
                    data.id,
                    data.name,
                    data.price,
                    data.availability,
                    data.mealTime,
                ],
            );
            await addNotification('New item added: ' + data.name);
            connection.release();
            socket.emit('add_item_response', {
                success: true,
                message: 'Item added successfully',
            });
        } catch (err) {
            socket.emit('add_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    //Event listener for deleting a menu item
    socket.on('delete_item', async data => {
        const { itemId, role } = data;
        try {
            if (role !== 'admin') {
                socket.emit('add_item_response', {
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

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

    //Event listener for updating a menu item
    socket.on('update_item', async ({ itemId, name, price }) => {
        try {
            const connection = await pool.getConnection();
            await connection.execute(
                'UPDATE menuItem SET itemName = ?, price = ? WHERE itemId = ?',
                [name, price, itemId],
            );
            await addNotification('item updated: ' + name);
            connection.release();

            socket.emit('update_item_response', { success: true });
        } catch (err) {
            socket.emit('update_item_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};

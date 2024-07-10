import { Socket } from 'socket.io';
import { MenuItem } from '../../models/menuItem';
import { addNotification } from './addNotification';
import { pool } from '../../Db/db';
import { RowDataPacket } from 'mysql2';

// Handle admin-specific socket events
export const handleAdminEvents = (socket: Socket) => {
    // Event listener for adding a menu item
    socket.on('add_item', async (data: MenuItem) => {
        await addItem(socket, data);
    });

    // Event listener for deleting a menu item
    socket.on('delete_item', async (data: any) => {
        await deleteItem(socket, data);
    });

    // Event listener for updating availability of a menu item
    socket.on('update_item', async ({ itemId, availability }) => {
        await updateItem(socket, itemId, availability);
    });
};

// Function to add a new menu item
async function addItem(socket: Socket, data: MenuItem) {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(
            'INSERT INTO menuitem (itemId, itemName, price, mealType, availability, diet_category, spice_level, sweet_level, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.id,
                data.name,
                data.price,
                data.availability,
                data.mealTime,
                data.diet_category,
                data.spice_level,
                data.sweetDish,
                data.area,
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
        console.error('Database query error:', err);
    }
}

// Function to delete a menu item
async function deleteItem(socket: Socket, data: any) {
    const { itemId } = data;
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
        console.error('Database query error:', err);
    }
}

// Function to update availability of a menu item
async function updateItem(
    socket: Socket,
    itemId: string,
    availability: boolean,
) {
    try {
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
        console.error('Database query error:', err);
    }
}

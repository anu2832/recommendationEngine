import { Socket } from 'socket.io';
import { getConnection } from '../../utils/databaseHandler';
import MenuItemManager from '../databaseHandler/AdminDatabaseHandler';
import { MenuItem } from '../../models/MenuItem';
import { DatabaseError, ItemOperationError } from '../CustomException';

export class AdminEventHandler {
    private menuItemManager: MenuItemManager;

    constructor(private socket: Socket) {
        this.menuItemManager = new MenuItemManager();
        this.initializeEvents();
    }

    private async initializeEvents() {
        try {
            const connection = await getConnection();

            this.socket.on('add_item', async (data: MenuItem) => {
                try {
                    await this.menuItemManager.addItem(this.socket, connection, data);
                } catch (err) {
                    if (err instanceof DatabaseError) {
                        this.socket.emit('add_item_response', {
                            success: false,
                            message: 'Database error occurred while adding item.',
                        });
                    } else {
                        this.socket.emit('add_item_response', {
                            success: false,
                            message: 'Failed to add item.',
                        });
                    }
                    console.error('Error adding item:', err);
                }
            });

            this.socket.on('delete_item', async (data: any) => {
                try {
                    await this.menuItemManager.deleteItem(this.socket, connection, data);
                } catch (err) {
                    if (err instanceof DatabaseError) {
                        this.socket.emit('delete_item_response', {
                            success: false,
                            message: 'Database error occurred while deleting item.',
                        });
                    } else {
                        this.socket.emit('delete_item_response', {
                            success: false,
                            message: 'Failed to delete item.',
                        });
                    }
                    console.error('Error deleting item:', err);
                }
            });

            this.socket.on('update_item', async ({ itemId, availability }) => {
                try {
                    await this.menuItemManager.updateItem(this.socket, connection, itemId, availability);
                } catch (err) {
                    if (err instanceof DatabaseError) {
                        this.socket.emit('update_item_response', {
                            success: false,
                            message: 'Database error occurred while updating item.',
                        });
                    } else if (err instanceof ItemOperationError) {
                        this.socket.emit('update_item_response', {
                            success: false,
                            message: err.message,
                        });
                    } else {
                        this.socket.emit('update_item_response', {
                            success: false,
                            message: 'Failed to update item.',
                        });
                    }
                    console.error('Error updating item:', err);
                }
            });

        } catch (err) {
            console.error('Error getting connection from pool:', err);
        }
    }
}

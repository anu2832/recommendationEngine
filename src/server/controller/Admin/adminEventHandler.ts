import { Socket } from 'socket.io';
import MenuItemManager from './menuItemManager';
import { getConnection } from '../../../utils/databaseHandler';
import { MenuItem } from '../../../models/menuItem';

export class AdminEventHandler {
    private menuItemManager: MenuItemManager;

    constructor(private socket: Socket) {
        this.menuItemManager = new MenuItemManager();
        this.initializeEvents();
    }

    private initializeEvents() {
        getConnection()
            .then(connection => {
                this.socket.on(
                    'add_item',
                    async (data: MenuItem) =>
                        await this.menuItemManager.addItem(
                            this.socket,
                            connection,
                            data,
                        ),
                );
                this.socket.on(
                    'delete_item',
                    async (data: any) =>
                        await this.menuItemManager.deleteItem(
                            this.socket,
                            connection,
                            data,
                        ),
                );
                this.socket.on(
                    'update_item',
                    async ({ itemId, availability }) =>
                        await this.menuItemManager.updateItem(
                            this.socket,
                            connection,
                            itemId,
                            availability,
                        ),
                );
            })
            .catch(err => {
                console.error('Error getting connection from pool:', err);
            });
    }
}

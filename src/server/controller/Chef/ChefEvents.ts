import { Socket } from 'socket.io';
import { PoolConnection } from 'mysql2/promise';
import { getTopFoodItems } from '../../../Recomendation';
import { Database } from './Databse';
import { getConnection } from '../../../utils/databaseHandler';
import notificationManager from '../notification/notificationManager';

export class ChefEvents {
    private db: Database;
    private connection: PoolConnection | null = null;

    constructor(private socket: Socket) {
        this.db = new Database();
        this.init();
    }

    private async init() {
        try {
            this.connection = await getConnection();
            this.registerSocketEvents();
        } catch (err) {
            console.error('Error getting connection from pool:', err);
        }
    }

    private registerSocketEvents() {
        if (!this.connection) {
            throw new Error('Database connection not initialized.');
        }

        this.socket.on('check_item_exists', async ({ itemId }) => {
            await this.checkItemExists(itemId);
        });

        this.socket.on('create_rollout', async data => {
            await this.createRollout(data);
        });

        this.socket.on('selectedMenu', async data => {
            await this.selectMenu(data);
        });

        this.socket.on('allDiscardedItems', async data => {
            await this.createDiscardList(data);
        });

        this.socket.on('modifyDiscardList', async data => {
            await this.modifyDiscardList(data);
        });

        this.socket.on('see_menu', async () => {
            await this.viewMenu();
        });

        this.socket.on('see_feedback', async () => {
            await this.viewFeedback();
        });

        this.socket.on('disconnect', () => {
            if (this.connection) {
                this.connection.release();
                this.connection = null;
            }
        });
    }

    private async checkItemExists(itemId: string) {
        try {
            const exists = await this.db.checkItemExists(
                this.connection!,
                itemId,
            );
            this.socket.emit('check_item_exists_response', {
                success: true,
                exists,
            });
        } catch (err) {
            this.socket.emit('check_item_exists_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async modifyDiscardList(data: any) {
        const { choice, id } = data;
        try {
            const discardResults = await this.db.getDiscardItemList(
                this.connection!,
                id,
            );

            if (discardResults.length === 0) {
                this.socket.emit('modify_discard_list_response', {
                    success: false,
                    message: 'Item not found in discard list.',
                });
                return;
            }

            if (choice === 'menu') {
                await this.connection!.beginTransaction();

                await this.db.deleteFromDiscardItemList(this.connection!, id);
                await this.db.deleteFromMenuItem(this.connection!, id);

                await this.connection!.commit();

                this.socket.emit('modify_discard_list_response', {
                    success: true,
                    message:
                        'Item successfully deleted from menu and discard list.',
                });
            } else if (choice === 'discard') {
                await this.db.deleteFromDiscardItemList(this.connection!, id);

                this.socket.emit('modify_discard_list_response', {
                    success: true,
                    message: 'Item successfully deleted from discard list.',
                });
            } else {
                this.socket.emit('modify_discard_list_response', {
                    success: false,
                    message: 'Invalid choice.',
                });
            }
        } catch (error) {
            console.error('Error modifying item:', error);

            this.socket.emit('modify_discard_list_response', {
                success: false,
                message: 'Failed to modify item.',
            });
        }
    }

    private async createRollout(data: any) {
        try {
            const currentDate = new Date().toISOString().slice(0, 10);
            const rolloutResults = await this.db.getRolloverItems(
                this.connection!,
                currentDate,
                data.menuType,
            );

            if (rolloutResults.length > 0) {
                console.log(
                    `RollOut menu is already created for ${data.menuType}`,
                );
                this.socket.emit('get_recommendation_response', {
                    success: false,
                    message: `RollOut menu is already created for ${data.menuType}`,
                    rolloutMenu: rolloutResults,
                });
                return;
            } else {
                const top5FoodItems = await getTopFoodItems(data.menuType);
                await notificationManager.addNotification(
                    'New item added: ' + data.name,
                );
                console.log(top5FoodItems);
            }

            this.socket.emit('create_rollout_response', {
                success: true,
                message: `New RollOut Menu created for  ${data.menuType}`,
                rolloutMenu: rolloutResults,
            });
        } catch (error) {
            console.error('Error fetching top 5 food items:', error);
            this.socket.emit('create_rollout_response', {
                success: false,
                message: 'Error fetching top 5 food items.',
            });
        }
    }

    private async selectMenu(data: any) {
        try {
            const maxVoteItem = await this.db.getMaxVotedItem(this.connection!);

            if (maxVoteItem.length > 0) {
                const { itemId, itemName, mealType } = maxVoteItem[0];
                const currentDate = new Date().toISOString().slice(0, 10);
                const existingFinalMenuItems =
                    await this.db.getFinalizedMenuItems(
                        this.connection!,
                        itemId,
                        currentDate,
                    );

                if (existingFinalMenuItems.length > 0) {
                    console.log(
                        `Item has already been added to the final_menu for '${mealType}' for today.`,
                    );
                    this.socket.emit('finalizedMenu_response', {
                        success: false,
                        message: `Item has already been added to the final_menu for '${mealType}' for today.`,
                    });
                    return;
                }

                await this.db.insertIntoFinalizedMenu(
                    this.connection!,
                    itemId,
                    itemName,
                    currentDate,
                );

                console.log(
                    `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
                );

                await notificationManager.addNotification(
                    `FinalMenu item: ${itemName} with ID ${itemId} added to final_menu for date ${currentDate}`,
                );

                this.socket.emit('finalizedMenu_response', {
                    success: true,
                    message: `Item '${itemName}' with ID '${itemId}' added to final_menu for date '${currentDate}'`,
                });
            } else {
                console.log('No items found in rollover table.');
                this.socket.emit('finalizedMenu_response', {
                    success: false,
                    message: 'No items found in rollover table.',
                });
            }
        } catch (error) {
            console.error('Error finalizing menu:', error);
            this.socket.emit('finalizedMenu_response', {
                success: false,
                message: 'Error finalizing menu.',
            });
        }
    }

    private async createDiscardList(data: any) {
        try {
            const canProceed = await this.canPerformOperation();
            let lowerItem = await getTopFoodItems();

            if (!canProceed) {
                console.log(
                    'You can only generate a discard list once a month.',
                );
                this.socket.emit('discard_response_chef', {
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
                this.socket.emit('discard_response_chef', {
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
                await this.db.insertIntoDiscardItemList(
                    this.connection!,
                    0,
                    item.foodId,
                    dateTime,
                );
                await this.db.deleteFromMenuItem(this.connection!, item.foodId);
            }

            console.log('Discard list generated successfully.');
            this.socket.emit('discard_response_chef', {
                success: true,
                message: 'Discard list generated successfully.',
                discardItems: lowerItem,
            });
        } catch (error) {
            console.error('Error in discard list making:', error);
            this.socket.emit('discard_response_chef', {
                success: false,
                message: 'Error in discard list making.',
            });
        }
    }

    private async viewMenu() {
        try {
            const results = await this.db.getMenuItems(this.connection!);
            this.socket.emit('see_menu_response', {
                success: true,
                menu: results,
            });
        } catch (err) {
            this.socket.emit('see_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async viewFeedback() {
        try {
            const results = await this.db.getFeedbackItems(this.connection!);
            console.log('results--->', results);

            this.socket.emit('see_feedback_response', {
                success: true,
                itemFeedback: results,
            });
        } catch (err) {
            this.socket.emit('see_feedback_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async canPerformOperation(): Promise<boolean> {
        const lastDiscardedItem = await this.db.getLatestDiscardedItem(
            this.connection!,
        );
        if (lastDiscardedItem) {
            if (this.isWithinLast30Days(lastDiscardedItem.date)) {
                return false;
            }
        }
        return true;
    }

    private isWithinLast30Days(date: string | Date): boolean {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const discardedAt = new Date(date);
        return discardedAt > oneMonthAgo;
    }
}

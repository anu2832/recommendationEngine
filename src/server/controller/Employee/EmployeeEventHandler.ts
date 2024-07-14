// src/handlers/employeeEventHandler.ts
import { Socket } from 'socket.io';
import {
    getUserProfile,
    updateUserProfile,
    insertUserProfile,
    getMenuItems,
    getFeedbacks,
    getRolloutItems,
    incrementVote,
    insertVotedUser,
    getVotedUser,
    insertFeedback,
    getFinalizedMenu,
    getNotifications,
    insertRecipe,
    getDiscardedItems
} from './MenuItemService';
import { getConnection } from '../../../utils/databaseHandler';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../../Db/db';

class EmployeeEventHandler {
    private socket: Socket;
    private connection: any;

    constructor(socket: Socket) {
        this.socket = socket;
        this.init();
    }

    private async init() {
        try {
            this.connection = await getConnection();
            this.setupListeners();
        } catch (err) {
            console.error('Error getting connection from pool:', err);
        }
    }

    private setupListeners() {
        this.socket.on('create_profile', async (data) => {
            await this.createProfile(data);
        });

        this.socket.on('discardItems_list', async (data) => {
            await this.seeDiscardList(data);
        });

        this.socket.on('view_menu', async (data) => {
            await this.viewMenu(data);
        });

        this.socket.on('view_feedbacks', async () => {
            await this.viewFeedbacks();
        });

        this.socket.on('rolloutMenu', async (data) => {
            console.log('server');
            await this.viewRolloutMenu(data);
        });

        this.socket.on('vote_for_menu', async (data) => {
            await this.voteForMenu(data);
        });

        this.socket.on('give_feedBack', async (data) => {
            await this.giveFeedback(data);
        });

        this.socket.on('finalizedMenu', async (data) => {
            await this.viewFinalizedMenu(data);
        });

        this.socket.on('viewNotification', async (data) => {
            await this.viewNotification(data);
        });

        this.socket.on('give_recipe', async data => {
            await this.giveOwnRecipe(data);
        });
    }

    private async createProfile(data: any) {
        const { userId, diet_category, spice_level, area, sweet_level } = data;
        try {
            const rows = await getUserProfile(userId);

            if (rows.length > 0) {
                await updateUserProfile(userId, diet_category, spice_level, area, sweet_level);
            } else {
                await insertUserProfile(userId, diet_category, spice_level, area, sweet_level);
            }

            this.socket.emit('create_profile_response', {
                success: true,
                message: 'Your profile has been created',
                result: data,
            });
        } catch (error) {
            this.socket.emit('create_profile_response', {
                success: false,
                message: 'Your profile not created',
            });
            console.error('Database query error', error);
        }
    }

    private async viewMenu(data: any) {
        const { userId } = data;
        try {
            const results = await getMenuItems();

            this.socket.emit('view_menu_response', {
                success: true,
                menu: results,
                userId: userId,
            });
        } catch (err) {
            this.socket.emit('view_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async viewFeedbacks() {
        try {
            console.log('clicked on feedback');
            const results = await getFeedbacks();

            this.socket.emit('view_feedbacks_response', {
                success: true,
                feedbacks: results,
            });
        } catch (err) {
            this.socket.emit('view_feedbacks_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async viewRolloutMenu(data: any) {
        const { userId } = data;
        console.log(userId);
        try {
            const userProfileResults = await getUserProfile(userId);
            console.log(userProfileResults);

            if (userProfileResults.length === 0) {
                this.socket.emit('rollout_response', {
                    success: false,
                    message: 'User profile not found',
                });
                return;
            }

            const userProfile = userProfileResults[0];

            const rolloutResults = await getRolloutItems();
            console.log(rolloutResults, '------------');

            const sortedRolloutItems = this.sortRolloutItems(
                rolloutResults,
                userProfile
            );

            this.socket.emit('rollout_response', {
                success: true,
                rollOutData: sortedRolloutItems,
                userId,
            });
        } catch (err) {
            console.log(err);
            this.socket.emit('rollout_response', {
                success: false,
                message: 'Database error',
                userId: userId,
            });
            console.error('Database query error', err);
        }
    }

    private async voteForMenu(data: any) {
        const { userId, itemId } = data;
        console.log('vote for menu ');
        try {
            const userVotes = await getVotedUser(userId);

            if (userVotes.length > 0) {
                this.socket.emit('vote_for_menu_response', {
                    success: false,
                    userId: userId,
                    message: 'You have already voted for an item.',
                });
                return;
            }

            await incrementVote(itemId);
            await insertVotedUser(userId, itemId);

            this.socket.emit('vote_for_menu_response', {
                success: true,
                message: 'Your vote has been recorded successfully.',
            });
        } catch (err) {
            this.socket.emit('vote_for_menu_response', {
                success: false,
                message: 'Database error occurred.',
            });
            console.error('Database query error', err);
        }
    }

    private async giveFeedback(data: any) {
        const { message, userId, rating, mealType, itemId } = data;

        try {
            const rows = await getMenuItems();
            if (rows.length === 0) {
                this.socket.emit('giveFeedback_response', {
                    success: false,
                    message: 'Menu item not found',
                });
                return;
            }

            const menuItem = rows[0];

            await insertFeedback(
                this.generateRandomItemId(),
                menuItem.itemId,
                userId,
                menuItem.itemName,
                message,
                rating,
                mealType
            );

            this.socket.emit('giveFeedback_response', {
                success: true,
                userId: userId,
                feedBack: rows,
            });
        } catch (err) {
            this.socket.emit('giveFeedback_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private async viewFinalizedMenu(data: any) {
        const { userId } = data;
        const currentDate = new Date().toISOString().slice(0, 10);

        try {
            const results = await getFinalizedMenu(currentDate);

            this.socket.emit('show_finalList_response', {
                success: true,
                userId: userId,
                finalList: results,
            });
        } catch (err) {
            this.socket.emit('show_finalList_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    async viewNotification(data: any) {
        const { userId } = data;
        console.log(data,"<-----------")
    try {
        const lastNotificationId = await this.getLastNotificationId(userId);
        const notifications = await getNotifications(
            lastNotificationId ?? 0,
        );

        const connection = await pool.getConnection();
        if (notifications.length > 0) {
            const latestNotificationId = notifications[0].notificationId;
            await this.updateLastNotificationId(userId, latestNotificationId);
        }
        connection.release();

        this.socket.emit('viewNotification_response', {
            success: true,
            userId: data.userId,
            notifications: notifications,
        });
    } catch (err) {
        this.socket.emit('viewNotification_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
    }

    async updateLastNotificationId(
        userId: number,
        notificationId: number,
    ) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM userNotificationHistory WHERE userId = ?',
                [userId],
            );
    
            if (rows.length > 0) {
                await connection.execute(
                    'UPDATE userNotificationHistory SET notificationId = ? WHERE userId = ?',
                    [notificationId, userId],
                );
            } else {
                await connection.execute(
                    'INSERT INTO userNotificationHistory (userId, notificationId) VALUES (?, ?)',
                    [userId, notificationId],
                );
            }
        } finally {
            connection.release();
        }
    }

    async getLastNotificationId(userId: number): Promise<number | null> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT notificationId FROM userNotificationHistory WHERE userId = ?',
                [userId],
            );
            if (rows.length > 0) {
                return rows[rows.length - 1].notificationId;
            } else {
                return null;
            }
        } finally {
            connection.release();
        }
    }

    // private async viewNotification(data: any) {
    //     const { userId } = data;

    //     console.log('hiii--------------------')
    //     console.log(userId)

    //     try {
    //         const results = await getNotifications(userId);

    //         this.socket.emit('viewNotification_response', {
    //             success: true,
    //             notifications: results,
    //         });
    //     } catch (err) {
    //         this.socket.emit('viewNotification_response', {
    //             success: false,
    //             message: 'Database error',
    //         });
    //         console.error('Database query error', err);
    //     }
    // }

    private async giveOwnRecipe(data: any) {
        const { id, dislikeReason, tasteExpectations, message } = data;
        try{
            const [discardResults] = await this.connection.execute(
                `SELECT d.*, m.itemName AS itemName, m.mealType
                FROM discardItemList d
                JOIN menuitem m ON d.itemId = m.itemId
                WHERE d.itemId = ?`,
                [id],
            );

            if (discardResults.length <= 0) {
                this.socket.emit('give_discard_response', {
                    success: false,
                    message: 'Item ID not found in discard list',
                });
                return;
            }

            await this.connection.execute(
                `INSERT INTO discardItemFeedback (itemId, itemConcern, tastePreference, ownReceipe) VALUES (?, ?, ?, ?)`,
                [id, dislikeReason, tasteExpectations, message],
            );

            this.socket.emit('give_discard_response', {
                success: true,
                message:
                    'Message, feedback, and rating stored in feedback table successfully',
                discardList: discardResults,
            });
    } catch (err) {
        this.socket.emit('give_discard_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
    }

    private async seeDiscardList(data: any) {
        const { userId } = data;

        try {
            const results = await getDiscardedItems(userId);

            this.socket.emit('discard_response', {
                success: true,
                discardedItems: results,
            });
        } catch (err) {
            this.socket.emit('discard_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    }

    private sortRolloutItems(rolloutItems: any[], userProfile: any): any[] {
        return rolloutItems.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            if (a.diet_category === userProfile.diet_category) scoreA++;
            if (a.spice_level === userProfile.spice_level) scoreA++;
            if (a.area === userProfile.area) scoreA++;
            if (a.sweet_level === userProfile.sweet_level) scoreA++;

            if (b.diet_category === userProfile.diet_category) scoreB++;
            if (b.spice_level === userProfile.spice_level) scoreB++;
            if (b.area === userProfile.area) scoreB++;
            if (b.sweet_level === userProfile.sweet_level) scoreB++;

            return scoreB - scoreA;
        });
    }

    private generateRandomItemId(): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomItemId = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomItemId += characters.charAt(randomIndex);
        }
        return randomItemId;
    }
}

export { EmployeeEventHandler };

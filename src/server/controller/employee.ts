import { Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../Db/db';


export const handleEmployeeEvents = (socket: Socket) => {
    socket.on('create_profile', async data => {
        const {
            userId,
            diet_category,
            spice_level,
            area,
            sweet_level,
        } = data;
        
          console.log(data,userId,"data->")
        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM userInformation WHERE userId = ?',
                [userId],
            );
 
            if (rows.length > 0) {
                await pool.query(
                    'UPDATE userInformation SET diet_category = ?, spice_level = ?, area = ?, sweet_level = ? WHERE userId = ?',
                    [
                        diet_category,
                        spice_level,
                        area,
                        sweet_level,
                        userId,
                    ],
                );
            } else {
                await pool.query(
                    'INSERT INTO userInformation (userId, diet_category, spice_level, area, sweet_level) VALUES (?, ?, ?, ?, ?)',
                    [
                        userId,
                        diet_category,
                        spice_level,
                        sweet_level,
                        area,
                    ],
                );
            }
            console.log('Your profile has been created');
 
            socket.emit('create_profile_response', {
                success: false,
                message: 'Your profile has been created',
                result: data,
            });
        } catch (error) {
            socket.emit('create_profile_response', {
                success: false,
                message: 'Your profile not created',
            });
            console.error('Database query error', error);
        }
    });
 
    // Handle 'view_menu' event to fetch and send the menu items to the client.
    socket.on('view_menu', async (data) => {
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM menuitem',
            );
            connection.release();

            socket.emit('view_menu_response', { success: true, menu: results,userId: userId });
        } catch (err) {
            socket.emit('view_menu_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    /// Handle 'view_feedbacks' event to fetch and send feedbacks to the client.
    socket.on('view_feedbacks', async () => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM feedBack',
            );
            connection.release();

            socket.emit('view_feedbacks_response', {
                success: true,
                menu: results,
            });
        } catch (err) {
            socket.emit('view_feedbacks_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    // Handle 'rolloutMenu' event to fetch and send the rolled-out menu items to the client.
    socket.on('rolloutMenu', async (data) => {
        const { userId } = data;
        let connection;
        try {
            connection = await pool.getConnection();
 
            // Fetch user profile
            const [userProfileResults] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM userInformation WHERE userId = ?',
                [userId]
            );
 
            if (userProfileResults.length === 0) {
                socket.emit('view_rollout_response', {
                    success: false,
                    message: 'User profile not found',
                });
                return;
            }
 
            const userProfile = userProfileResults[0];
            console.log(userProfile);
 
            // Fetch rollout items with details from menuitem table
            const [rolloutResults] = await connection.execute<RowDataPacket[]>(
                `SELECT r.*,
                    m.diet_category,  
                    m.spice_level,
                    m.area,
                    m.sweet_level
             FROM rollover r
             JOIN menuitem m ON r.itemId = m.itemId`
            );
 
            // Sort rollout items based on user profile
            const sortedRolloutItems = rolloutResults.sort((a, b) => {
                // Custom sorting logic based on user profile
 
                // Sort by diet preference
                if (a.diet_category === userProfile.diet_category && b.diet_category !== userProfile.diet_category) {
                    return -1;
                }
                if (a.diet_category !== userProfile.diet_category && b.diet_category === userProfile.diet_category) {
                    return 1;
                }
 
                // Sort by spice preference
                if (a.spice_level === userProfile.spice_level && b.spice_level !== userProfile.spice_level) {
                    return -1;
                }
                if (a.spice_level !== userProfile.spice_level && b.spice_level === userProfile.spice_level) {
                    return 1;
                }
 
                // Sort by region preference
                if (a.area === userProfile.area && b.area !== userProfile.area) {
                    return -1;
                }
                if (a.area !== userProfile.area && b.area === userProfile.area) {
                    return 1;
                }
 
                // Sort by sweet dish preference
                if (a.sweet_level === userProfile.sweet_level && b.sweet_level !== userProfile.sweet_level) {
                    return -1;
                }
                if (a.sweet_level !== userProfile.sweet_level && b.sweet_level === userProfile.sweet_level) {
                    return 1;
                }
 
                return 0;
            });
 
            console.log(sortedRolloutItems)
            connection.release();
 
            socket.emit('rollout_response', {
                success: true,
                rollOutData: sortedRolloutItems,
                userId,
            });
        } catch (err) {
            socket.emit('rollout_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
    // Handle 'voteForMenu' event to fetch and send the rolled-out menu items to the client.
    socket.on('vote_for_menu', async data => {
        const { userId, itemId } = data;
        try {
            const connection = await pool.getConnection();
            await connection.beginTransaction();
            const [userVotes] = await connection.execute<RowDataPacket[]>(
                'SELECT userId FROM votedUsers WHERE userId = ?',
                [userId],
            );
            console.log(userVotes);
            if (userVotes.length > 0) {
                socket.emit('vote_for_menu_response', {
                    success: false,
                    userId: userId,
                    message: 'You have already voted for an item.',
                });
                await connection.rollback();
                connection.release();
                return;
            }
            await connection.execute(
                'UPDATE rollover SET vote = vote + 1 WHERE itemId = ?',
                [itemId],
            );
            await connection.execute(
                'INSERT INTO votedUsers (userId, itemId) VALUES (?, ?)',
                [userId, itemId],
            );
            await connection.commit();
            connection.release();
            socket.emit('vote_for_menu_response', {
                success: true,
                message: 'Your vote has been recorded successfully.',
            });
        } catch (err) {
            socket.emit('vote_for_menu_response', {
                success: false,
                message: 'Database error occurred.',
            });
            console.error('Database query error', err);
        }
    });

    socket.on(
        'give_feedBack',
        async ({ itemId, message, userId, rating, mealType }) => {
            console.log(itemId, message, userId, rating);
            try {
                const connection = await pool.getConnection();

                const [rows] = await connection.execute<RowDataPacket[]>(
                    'SELECT * FROM menuitem WHERE itemId = ?',
                    [itemId],
                );

                const menuItem = rows[0];
                console.log(
                    itemId,
                    menuItem.itemId,
                    userId,
                    menuItem.itemName,
                    message,
                    rating,
                    menuItem.mealType,
                );

                await connection.execute(
                    'INSERT INTO feedBack (id, itemId, userName, itemName, message, rating, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        itemId,
                        menuItem.itemId,
                        userId,
                        menuItem.itemName,
                        message,
                        rating,
                        menuItem.mealType,
                    ],
                );

                connection.release();

                socket.emit('giveFeedback_response', {
                    success: true,
                    userId: userId,
                });
            } catch (err) {
                socket.emit('giveFeedback_response', {
                    success: false,
                    message: 'Database error',
                });
                console.error('Database query error', err);
            }
        },
    );

    socket.on('finalizedMenu', async data => {
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM finalizedMenu',
            );
            connection.release();
            socket.emit('show_finalList_response', {
                success: true,
                userId: userId,
                finalList: results,
            });
        } catch (err) {
            socket.emit('show_finalList_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });

    // socket.on('viewNotification', async data => {
    //     try {
    //         const connection = await pool.getConnection();
    //         const [results] = await connection.execute(
    //             'SELECT * FROM notifications',
    //         );
    //         connection.release();
    //         socket.emit('viewNotification_response', {
    //             success: true,
    //             notifications: results,
    //         });
    //         console.log();
    //     } catch (err) {
    //         socket.emit('viewNotification_response', {
    //             success: false,
    //             message: 'Database error',
    //         });
    //         console.error('Database query error', err);
    //     }
    // });
    
socket.on('viewNotification', async data => {
        const { userId } = data;
        console.log(userId);
        try {
            const lastNotificationId = await getLastNotificationId(userId);
            const notifications = await getNotifications(
                lastNotificationId ?? undefined,
            );
 
            const connection = await pool.getConnection();
            if (notifications.length > 0) {
                const latestNotificationId = notifications[0].notificationId;
                console.log(latestNotificationId);
 
                await updateLastNotificationId(userId, latestNotificationId);
            }
 
            socket.emit('viewNotification_response', {
                success: true,
                userId: data.userId,
                notifications: notifications,
            });
        } catch (err) {
            socket.emit('viewNotification_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
 
};

async function getLastNotificationId(userId: number): Promise<number | null> {
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
 
async function updateLastNotificationId(
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
 
export async function getNotifications(sinceNotificationId?: number) {
    const connection = await pool.getConnection();
    try {
        if (sinceNotificationId) {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications WHERE notificationId > ? ORDER BY createdAt DESC',
                [sinceNotificationId],
            );
            return results;
        } else {
            const [results] = await connection.execute<RowDataPacket[]>(
                'SELECT * FROM notifications ORDER BY createdAt DESC',
            );
            return results;
        }
    } finally {
        connection.release();
    }
}
 
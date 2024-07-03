import { Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../Db/db';

// Handle events related to employee actions
export const handleEmployeeEvents = (socket: Socket) => {
    socket.on('create_profile', async data => {
        await createProfile(socket, data);
    });

    socket.on('view_menu', async data => {
        await viewMenu(socket, data);
    });

    socket.on('view_feedbacks', async () => {
        await viewFeedbacks(socket);
    });

    socket.on('rolloutMenu', async data => {
        await viewRolloutMenu(socket, data);
    });

    socket.on('vote_for_menu', async data => {
        await voteForMenu(socket, data);
    });

    socket.on('give_feedBack', async data => {
        await giveFeedback(socket, data);
    });

    socket.on('finalizedMenu', async data => {
        await viewFinalizedMenu(socket, data);
    });

    socket.on('viewNotification', async data => {
        await viewNotification(socket, data);
    });
};

// Function to create or update a user profile
async function createProfile(socket: Socket, data: any) {
    const { userId, diet_category, spice_level, area, sweet_level } = data;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM userInformation WHERE userId = ?',
            [userId],
        );

        if (rows.length > 0) {
            await pool.query(
                'UPDATE userInformation SET diet_category = ?, spice_level = ?, area = ?, sweet_level = ? WHERE userId = ?',
                [diet_category, spice_level, area, sweet_level, userId],
            );
        } else {
            await pool.query(
                'INSERT INTO userInformation (userId, diet_category, spice_level, area, sweet_level) VALUES (?, ?, ?, ?, ?)',
                [userId, diet_category, spice_level, sweet_level, area],
            );
        }
        connection.release();

        socket.emit('create_profile_response', {
            success: true,
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
}

// Function to view the menu items
async function viewMenu(socket: Socket, data: any) {
    const { userId } = data;
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(
            'SELECT * FROM menuitem',
        );
        connection.release();

        socket.emit('view_menu_response', {
            success: true,
            menu: results,
            userId: userId,
        });
    } catch (err) {
        socket.emit('view_menu_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
}

// Function to view feedbacks
async function viewFeedbacks(socket: Socket) {
    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(
            'SELECT * FROM feedBack',
        );
        connection.release();

        socket.emit('view_feedbacks_response', {
            success: true,
            feedbacks: results,
        });
    } catch (err) {
        socket.emit('view_feedbacks_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
}

// Function to view the rollout menu items
async function viewRolloutMenu(socket: Socket, data: any) {
    const { userId } = data;
    let connection;
    try {
        connection = await pool.getConnection();

        // Fetch user profile
        const [userProfileResults] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM userInformation WHERE userId = ?',
            [userId],
        );

        if (userProfileResults.length === 0) {
            socket.emit('view_rollout_response', {
                success: false,
                message: 'User profile not found',
            });
            return;
        }

        const userProfile = userProfileResults[0];

        // Fetch rollout items with details from menuitem table
        const [rolloutResults] = await connection.execute<RowDataPacket[]>(
            `SELECT r.*, m.diet_category, m.spice_level, m.area, m.sweet_level
             FROM rollover r
             JOIN menuitem m ON r.itemId = m.itemId`,
        );

        // Sort rollout items based on user profile
        const sortedRolloutItems = sortRolloutItems(rolloutResults, userProfile);

        connection.release();

        socket.emit('rollout_response', {
            success: true,
            rollOutData: sortedRolloutItems,
            userId,
        });
    } catch (err) {
        if (connection) connection.release();
        socket.emit('rollout_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
}

// Function to vote for a menu item
async function voteForMenu(socket: Socket, data: any) {
    const { userId, itemId } = data;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        const [userVotes] = await connection.execute<RowDataPacket[]>(
            'SELECT userId FROM votedUsers WHERE userId = ?',
            [userId],
        );

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
}

function generateRandomItemId(): number {
    return Math.floor(Math.random() * 1000); 
}

// Function to give feedback on a menu item
async function giveFeedback(socket: Socket, data: any) {
    const { message, userId, rating, mealType , itemId} = data;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM menuitem WHERE itemId = ?',
            [itemId],
        );

        // Check if menu item exists
        if (rows.length === 0) {
            socket.emit('giveFeedback_response', {
                success: false,
                message: 'Menu item not found',
            });
            connection.release();
            return;
        }

        const menuItem = rows[0];

        await connection.execute(
            'INSERT INTO feedBack (id, itemId, userName, itemName, message, rating, mealType) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                generateRandomItemId(),
                menuItem.itemId,
                userId,
                menuItem.itemName,
                message,
                rating,
                mealType,
            ],
        );

        connection.release();

        socket.emit('giveFeedback_response', {
            success: true,
            userId: userId,
            feedBack: rows,
        });
    } catch (err) {
        socket.emit('giveFeedback_response', {
            success: false,
            message: 'Database error',
        });
        console.error('Database query error', err);
    }
}

// Function to view the finalized menu items
// async function viewFinalizedMenu(socket: Socket, data: any) {
//     const { userId } = data;
//     try {
//         const connection = await pool.getConnection();
//         const [results] = await connection.execute(
//             'SELECT * FROM finalizedMenu',
//         );
//         connection.release();

//         socket.emit('show_finalList_response', {
//             success: true,
//             userId: userId,
//             finalList: results,
//         });
//     } catch (err) {
//         socket.emit('show_finalList_response', {
//             success: false,
//             message: 'Database error',
//         });
//         console.error('Database query error', err);
//     }
// }
async function viewFinalizedMenu(socket: Socket, data: any) {
    const { userId } = data;
    const currentDate = new Date().toISOString().slice(0, 10); // Get the current date in 'YYYY-MM-DD' format

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM finalizedMenu WHERE preparedOn = ?',
            [currentDate],
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
}

export { viewFinalizedMenu };

// Function to view notifications
async function viewNotification(socket: Socket, data: any) {
    const { userId } = data;
    try {
        const lastNotificationId = await getLastNotificationId(userId);
        const notifications = await getNotifications(lastNotificationId ?? undefined);

        const connection = await pool.getConnection();
        if (notifications.length > 0) {
            const latestNotificationId = notifications[0].notificationId;
            await updateLastNotificationId(userId, latestNotificationId);
        }
        connection.release();

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
}

// Function to sort rollout items based on user profile
function sortRolloutItems(rolloutResults: RowDataPacket[], userProfile: any) {
    return rolloutResults.sort((a, b) => {
        if (a.diet_category === userProfile.diet_category && b.diet_category !== userProfile.diet_category) {
            return -1;
        }
        if (a.diet_category !== userProfile.diet_category && b.diet_category === userProfile.diet_category) {
            return 1;
        }
        if (a.spice_level === userProfile.spice_level && b.spice_level !== userProfile.spice_level) {
            return -1;
        }
        if (a.spice_level !== userProfile.spice_level && b.spice_level === userProfile.spice_level) {
            return 1;
        }
        if (a.area === userProfile.area && b.area !== userProfile.area) {
            return -1;
        }
        if (a.area !== userProfile.area && b.area === userProfile.area) {
            return 1;
        }
        if (a.sweet_level === userProfile.sweet_level && b.sweet_level !== userProfile.sweet_level) {
            return -1;
        }
        if (a.sweet_level !== userProfile.sweet_level && b.sweet_level === userProfile.sweet_level) {
            return 1;
        }

        return 0;
    });
}

// Function to get the last notification ID for a user
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

// Function to update the last notification ID for a user
async function updateLastNotificationId(userId: number, notificationId: number) {
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

// Function to get notifications
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


import { Socket } from 'socket.io';
import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../db/db';

export const handleEmployeeEvents = (socket: Socket) => {
    // Handle 'view_menu' event to fetch and send the menu items to the client.
    socket.on('view_menu', async () => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM menuitem',
            );
            connection.release();

            socket.emit('view_menu_response', { success: true, menu: results });
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
    socket.on('rolloutMenu', async data => {
        console.log('menu rolled');
        const { userId } = data;
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM rollover',
            );
            connection.release();
            socket.emit('view_rolledOut_Menu', {
                success: true,
                rollout: results,
                userId: userId,
            });
            console.log(results);
        } catch (err) {
            socket.emit('view_rolledOut_Menu', {
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

    // socket.on('give_feedBack', async ({ itemId, userId, item, message, createdTime, mealType, rating }) => {
    //     console.log(itemId, userId, item, message, createdTime, mealType, rating);
    //     try {
    //         const connection = await pool.getConnection();
    //         const [rows] = await connection.execute<RowDataPacket[]>(
    //             'SELECT * FROM menuitem WHERE itemId = ?',
    //             [itemId],
    //         );
    //         const menuItem = rows[0];
    //         console.log(menuItem);
    //         console.log(menuItem.itemId,
    //             userId,
    //             menuItem.itemName,
    //             message,
    //             "15-06-2024",
    //             rating,
    //             mealType)
    //         await connection.execute(

    //             'INSERT INTO feedback (itemId, userId, item, message, createdTime, mealType,rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //             [

    //                 menuItem.itemId,
    //                 userId,
    //                 menuItem.itemName,
    //                 message,
    //                 "15",
    //                 rating,
    //                 menuItem.MealType,
    //             ],

    //         );
    //         connection.release();
    //         socket.emit('update_item_response', { success: true });
    //     } catch (err) {
    //         socket.emit('update_item_response', {
    //             success: false,
    //             message: 'Database error',
    //         });
    //         console.error('Database query error', err);
    //     }
    // });

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

    socket.on('viewNotification', async data => {
        try {
            const connection = await pool.getConnection();
            const [results] = await connection.execute(
                'SELECT * FROM notifications',
            );
            connection.release();
            socket.emit('viewNotification_response', {
                success: true,
                notifications: results,
            });
            console.log();
        } catch (err) {
            socket.emit('viewNotification_response', {
                success: false,
                message: 'Database error',
            });
            console.error('Database query error', err);
        }
    });
};

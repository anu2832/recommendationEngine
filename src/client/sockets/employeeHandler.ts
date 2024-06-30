import { question, rl } from '../../utils/rl';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';
import { finalizedMenu } from './chefHandler';

export function employeeMenu(userId: string) {
    console.log('Employee operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       See menu            |');
    console.log('|    2     |       Vote for Menu       |');
    console.log('|    3     |       Provide feedback    |');
    console.log('|    4     |       View Feedback       |');
    console.log('|    5     |       View Notification   |');
    console.log('|    6     |        Logout\n           |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                seeMenu();
                break;
            case '2':
                voteforMenu(userId);
                break;
            case '3':
                providingFeedback(userId);
                break;
            case '4':
                viewFeedbacks();
                break;
            case '5':
                viewNotification();
                break;
            case '6':
                logOut();
            default:
                console.log('Invalid option');
                employeeMenu(userId);
        }
    });
}

function viewFeedbacks() {
    socket.emit('view_feedbacks');
}

function voteforMenu(userId: string) {
    socket.emit('rolloutMenu', { userId: userId });
}

function viewNotification() {
    socket.emit('viewNotification');
}
function displayFinalMenu(userId: string) {
    socket.emit('finalizedMenu', { userId: userId });
}

async function giveFeedbackInput(userId: string) {
    const id = await question('Item id ');
    const feedback = await question('Item feedback ');
    const rating = await question('Item rating ');
    const mealType = await question('Which type of meal -> ');
    socket.emit('give_feedBack', {
        itemId: id,
        message: feedback,
        userId: userId,
        rating: rating,
        mealType: mealType,
    });
}

async function providingFeedback(userId: string) {
    displayFinalMenu(userId);
}
async function giveFeedback(userId: string) {
    finalizedMenu();
}
export async function seeMenu() {
    socket.emit('view_menu');
}
socket.on('view_menu_response', data => {
    if (data.success) {
        console.log('Menu Items:');
        data.menu.forEach(
            (item: {
                itemId: any;
                itemName: any;
                price: any;
                availability: any;
                mealType: any;
            }) => {
                console.log(
                    `ID: ${item.itemId}, Name: ${item.itemName}, Price: ${item.price}, Availability: ${item.availability}, Meal Time: ${item.mealType}`,
                );
            },
        );
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
    employeeMenu('123');
});

socket.on('viewNotification_response', data => {
    if (data.success) {
        console.log(' Notification');
        console.table(data.notifications);
    } else {
        console.error(data.message);
    }
});
socket.on(
    'vote_for_menu_response',
    (data: { success: boolean; message: any; userId: string }) => {
        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.message);
        }
        employeeMenu(data.userId);
    },
);
socket.on('view_feedbacks_response', data => {
    console.log(data);
    if (data.success) {
        console.log('FeedBacks:');
        data.menu.forEach(
            (item: {
                itemId: any;
                userId: any;
                item: any;
                message: any;
                createdTime: any;
                mealType: any;
                rating: any;
            }) => {
                console.log(
                    `ID: ${item.itemId}, Name: ${item.item}, Feedback: ${item.message}, Time: ${item.createdTime}`,
                );
            },
        );
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
});
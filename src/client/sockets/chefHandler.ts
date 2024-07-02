import { question, rl } from '../../utils/rl';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function chefMenu() {
    console.log('Chef operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       View Menu           |');
    console.log('|    2     |       RollOut Menu        |');
    console.log('|    3     |       Finalize Menu       |');
    console.log('|    4     |       Discard Item List   |');
    console.log('|    5     |       See feedback        |');
    console.log('|    6     |       Logout              |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                viewMenu();
                break;
            case '2':
                menuRollOut();
                break;
            case '3':
                finalizedMenu();
                break;
            case '4':
                discardItemList();
                break;
            case '5':
                seeFeedback();
                break;
            case '6':
                logOut();
            default:
                console.log('Invalid option');
                chefMenu();
        }
    });
}

async function menuRollOut() {
    const menuType = await question('Rolled Out menu:');
    socket.emit('create_rollout', { menuType: menuType });
}


export async function finalizedMenu() {
    socket.emit('selectedMenu');
}
function discardItemList() {
    socket.emit('discardItemList');
}
function viewMenu() {
    socket.emit('see_menu');
}
function seeFeedback() {
    socket.emit('see_feedback');
}
socket.on(
    'create_rollout_response',
    (data: { success: boolean; message: string; rolledOutMenu: any }) => {
        if (data.success) {
            if (data.rolledOutMenu) {
                console.log(data.message);
                console.table(data.rolledOutMenu);
            }
        } else {
            console.log('Failed to rollout: ' + data.message);
        }
        chefMenu();
    },
);

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

socket.on('see_menu_response', data => {
    if (data.success) {
        console.table(data.menu);
    } else {
        console.error(data.message);
    }
    chefMenu();
});
 
socket.on('see_feedback_response', data => {
    if (data.success) {
        console.table(data.itemFeedback);
        chefMenu();
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
        chefMenu();
    }
});

socket.on('discard_response', data => {
    if (data.success) {
        console.table(data.message);
        console.log(data.discardItems)
        chefMenu();
    } else {
        console.log('Failed to create Discard List: ' + data.message);
        chefMenu();
    }
});




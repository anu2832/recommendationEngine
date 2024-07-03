import { question, rl } from '../../utils/rl';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

//Operations of Chef
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

// Emit an event to create a rollout menu based on menu type
async function menuRollOut() {
    const menuType = await question('Rolled Out menu:');
    socket.emit('create_rollout', { menuType: menuType });
}

// Emit an event to finalize the menu
export async function finalizedMenu() {
    socket.emit('selectedMenu');
}

// Emit an event to create a discard item list
function discardItemList() {
    socket.emit('discardItemList');
}

// Emit an event to view the current menu
function viewMenu() {
    socket.emit('see_menu');
}

// Emit an event to view feedback
function seeFeedback() {
    socket.emit('see_feedback');
}

// Handle response from the server for create_rollout event
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

// Prompt user for feedback input and emit give_feedback event
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

// Handle response for see_menu event
socket.on('see_menu_response', data => {
    if (data.success) {
        console.table(data.menu);
    } else {
        console.error(data.message);
    }
    chefMenu();
});

// Handle response for see_feedback event
socket.on('see_feedback_response', data => {
    if (data.success) {
        console.table(data.itemFeedback);
        chefMenu();
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
        chefMenu();
    }
});

// Handle response for discard_item_list event
socket.on('discard_response', data => {
    if (data.success) {
        console.table(data.message);
        console.log(data.discardItems);
        chefMenu();
    } else {
        console.log('Failed to create Discard List: ' + data.message);
        chefMenu();
    }
});

// Handle response for finalized_menu event
socket.on('finalizedMenu_response', data => {
    if (data.success) {
        console.table(data.message);
        chefMenu();
    } else {
        console.log('Failed to show finalized menu: ' + data.message);
        chefMenu();
    }
});

// Handle response for get_recommendation event
socket.on('get_recommendation_response', data => {
    if (data.success) {
        console.table(data.message);
        chefMenu();
    } else {
        console.log('Failed to show the rolledOver menu: ' + data.message);
        chefMenu();
    }
});

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
    console.log('|    6     |       Create your Profile |');
    console.log('|    7     |       Logout\n            |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                seeMenu(userId);
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
                viewNotification(userId);
                break;
            case '6':
                makeProfile(userId);
                break;
            case '7':
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

function viewNotification(userId:string) {
    socket.emit('viewNotification',{ userId: userId });
}

function displayFinalMenu(userId: string) {
    socket.emit('finalizedMenu', { userId: userId });
} 

async function makeProfile(userId: string) {
    const diet_category = await question(
        'Are you vegetarian, non-vegetarian, or eggetarian?',
    );
    const spice_level = await question(
        'Do you prefer low, medium, or high spice levels?',
    );
    const area = await question(
        'Do you prefer North Indian or South Indian food?',
    );
    const sweet_level = await question('Do you like sweet foods?');
    console.log("userId->",userId)
    socket.emit('create_profile', {
        userId,
        diet_category,
        spice_level,
        area,
        sweet_level,
    });
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

export async function seeMenu(userId: string) {
    socket.emit('view_menu',{userId: userId});
}

async function voteForItem(userId: string) {
    const itemId = await question('Enter Item Id that you want to vote:  ');
    socket.emit('vote_for_menu', { userId: userId, itemId: itemId });
}

socket.on('view_menu_response', data => {
    if (data.success) {
      console.table(data.menu)
    } else {
        console.log('Failed to retrieve menu: ' + data.message);
    }
    employeeMenu(data.userId);
});
// Socket event handler
socket.on('viewNotification_response', data => {
    if (data.success) {
        console.log(' Notification');
        console.table(data.notifications);
    } else {
        console.error(data.message);
    }
    employeeMenu(data.userID)
});

socket.on(
    'vote_for_menu_response',
    (data: { success: boolean; message: any; userId: string }) => {
        console.log("data-->",data)
        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.message);
        }
        employeeMenu(data.userId);
    },
);

// Socket event handler
socket.on('view_feedbacks_response', data => {
    console.log(data);
    if (data.success) {
        console.table(data.menu)
    } else {
        console.log('Failed to retrieve feedbacks: ' + data.message);
    }
});

socket.on('create_profile_response', data => {
    if (data.success) {
        console.log('Your profile is created\n');
    } else {
        console.error(data.message);
    }
    employeeMenu(data.userId);
});

socket.on('show_finalList_response', data => {
    console.log(" menu")
    if (data.success) {
        console.table(data.finalList);
        giveFeedbackInput(data.userId);
    } else {
        console.error(data.message);
    }
});

socket.on(
    'rollout_response',
    (data: { success: boolean; rollOutData: any; userId: string }) => {
        if (data.success) {
            console.log('Rollout data retrieval successful!');
            if (data.rollOutData) {
                console.log('            Rollout Table Data:            ');
                console.table(data.rollOutData);
                voteForItem(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed:', data);
        }
    },
);
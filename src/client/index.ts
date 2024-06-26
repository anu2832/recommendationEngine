import { io } from 'socket.io-client';
import { question, rl } from '../utils/rl';

const socket = io('http://localhost:3000');

function displayUserPortal() {
    console.log('\nUser Portal:');
    console.log('---------------------------------------');
    console.log('|  Option  |           Description     |');
    console.log('---------------------------------------');
    console.log('|    1     |           Register        |');
    console.log('|    2     |            Login          |');
    console.log('|    3     |           Logout          |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                creatingNewUser();
                break;
            case '2':
                login();
                break;
            case '3':
                logOut();
                break;
            default:
                console.log('\nInvalid option');
                displayUserPortal();
        }
    });
}

function creatingNewUser() {
    rl.question('Enter user ID: ', employeeId => {
        rl.question('Enter Name: ', name => {
            rl.question('Enter Role: ', role => {
                socket.emit('register', { employeeId, name, role });
            });
        });
    });
}

function login() {
    console.log('\nUser Login:');
    rl.question('| Enter Employee ID: ', employeeId => {
        rl.question('| Enter Name: ', name => {
            console.log(' Authenticating...');
            socket.emit('authenticate', { employeeId, name });
        });
    });
}

function logOut() {
    console.log('inside');
    socket.emit('logout');
    rl.close();
}

socket.on(
    'auth_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userID: string;
    }) => {
        console.log(data);
        if (data.success) {
            console.log('Login successful!');
            socket.emit('user_connected', data.userID);
            if (data.role) {
                manageRoleActivities(data.role, data.userID);
            }
        } else {
            console.log('Login failed: ' + data.message);
            displayUserPortal();
        }
    },
);

socket.on(
    'register_response',
    (data: { success: boolean; message: string; role?: string }) => {
        if (data.success) {
            console.log('Registration successful!');
            if (data.role) {
                // manageRoleActivities(data.role,);
            }
        } else {
            console.log('Registration failed: ' + data.message);
        }
        displayUserPortal();
    },
);

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

socket.on(
    'show_rollover_response',
    (data: { success: boolean; message: string; userId?: string }) => {
        console.log('inside');
        if (data.success) {
            console.log('Rollover items:', data.userId);
            socket.emit('vote_for_menu', {
                success: true,
                data: { userId: data.userId },
            });
        } else {
            console.error(data.message);
        }
    },
);

socket.on('add_item_response', data => {
    if (data.success) {
        console.log('Item added successfully!');
        rl.question('Do you want to add another item? (yes/no): ', answer => {
            if (answer.toLowerCase() === 'yes') {
                addItem('admin');
            } else {
                adminMenu();
            }
        });
    } else {
        console.log('Failed to add item: ' + data.message);
        rl.question(
            'Do you want to try again to add Item ? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    addItem('admin');
                } else {
                    adminMenu();
                }
            },
        );
    }
});

socket.on('delete_item_response', data => {
    if (data.success) {
        console.log('Item deleted successfully!');
        rl.question(
            'Do you want to delete another item? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    deleteItem('admin');
                } else {
                    adminMenu();
                }
            },
        );
    } else {
        console.log('Failed to delete item: ' + data.message);
        rl.question(
            'Do you want to try again to delete Item ? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    deleteItem('admin');
                } else {
                    adminMenu();
                }
            },
        );
    }
});

socket.on('update_item_response', data => {
    if (data.success) {
        console.log('Item updated successfully!');
        rl.question(
            'Do you want to update another item? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    updateItem('admin');
                } else {
                    adminMenu();
                }
            },
        );
    } else {
        console.log('Failed to update item: ' + data.message);
        rl.question(
            'Do you want to try again to update Item ? (yes/no): ',
            answer => {
                if (answer.toLowerCase() === 'yes') {
                    updateItem('admin');
                } else {
                    adminMenu();
                }
            },
        );
    }
});

socket.on('finalizedMenu', data => {
    if (data.success) {
        console.log('Final Menu:');
        console.table(data.finalList);
        providingFeedback(data.userId);
    } else {
        console.error(data.message);
    }
});

socket.on('giveFeedback_response', data => {
    if (data.success) {
        console.log('Feedback submitted successfully');
        employeeMenu(data.userId);
    } else {
        console.error(data.message);
    }
});

socket.on('discard_response', data => {
    if (data.success) {
        console.log('discart list');
        console.table(data.lowerItem);
        chefMenu();
    } else {
        console.error(data.message);
    }
});

async function providingFeedback(userId: string) {
    displayFinalMenu(userId);
}
async function giveFeedback(userId: string) {
    finalizedMenu();
}

function manageRoleActivities(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            adminMenu();
            break;
        case 'employee':
            employeeMenu(userId);
            break;
        case 'chef':
            chefMenu();
            break;
        default:
            console.log('No operations defined for this role.');
            displayUserPortal();
    }
}

function adminMenu() {
    console.log('\nAdmin Operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       Modify Menu         |');
    console.log('|    2     |       View Reports        |');
    console.log('|    3     |         Logout            |');
    console.log('---------------------------------------');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                modifyMenu();
                break;
            case '2':
                //deleteItem('admin')
                break;
            case '3':
                logOut();
                break;
            default:
                console.log('Invalid option');
                adminMenu();
        }
    });
}

function modifyMenu() {
    console.log('Modify Menu:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       Add Item            |');
    console.log('|    2     |       Update Item         |');
    console.log('|    3     |       Delete Item         |');
    console.log('|    4     |  Back to Admin Operations |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                addItem('admin');
                break;
            case '2':
                updateItem('admin');
                break;
            case '3':
                deleteItem('admin');
                break;
            case '4':
                adminMenu();
                break;
            default:
                console.log('Invalid option');
                modifyMenu();
        }
    });
}

async function updateItem(role: string) {
    const id = await question('Enter item Id that will be updated');
    socket.emit('check_item_exists', { itemId: id });

    socket.once('check_item_exists_response', async response => {
        if (response.success && response.exists) {
            const newName = await question('Enter new name for the item: ');
            const newPrice = await question('Enter new price for the item: ');
            socket.emit('update_item', {
                itemId: id,
                name: newName,
                price: newPrice,
            });
        } else {
            console.log('Item ID not found.');
            adminMenu();
        }
    });
}

async function addItem(role: string) {
    const id = await question('Item id ');
    const name = await question('Enter Name: ');
    const price = await question('Enter price: ');
    const availability = await question('Enter availability: ');
    const mealTime = await question('Enter mealType: ');
    socket.emit('add_item', { id, name, price, availability, role, mealTime });
}

async function deleteItem(role: string) {
    const itemId = await question('Item id ');
    socket.emit('delete_item', { itemId, role });
}

async function seeMenu() {
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

socket.on(
    'view_rolledOut_Menu',
    (data: { success: boolean; rollout: any; userId: string }) => {
        if (data.success) {
            console.log('Rollout data retrieval successful!');
            if (data.rollout) {
                console.log('            Rollout Table Data:            ');
                console.table(data.rollout);
                vote(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed:', data);
        }
    },
);

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

async function vote(userId: string) {
    const itemId = await question('Enter Item Id which to be vote');

    socket.emit('vote_for_menu', { userId: userId, itemId: itemId });
}

// employee functions
function employeeMenu(userId: string) {
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
socket.on('show_finalList_response', data => {
    if (data.success) {
        console.log('Final Menu:');
        console.table(data.finalList);
        giveFeedbackInput(data.userId);
    } else {
        console.error(data.message);
    }
});
async function giveFeedbackInput(userId: string) {
    const id = await question('Item id ');
    const feedback = await question('Item feedback ');
    const rating = await question('Item rating ');
    const mealType = await question('Which type of meal - ');
    socket.emit('give_feedBack', {
        itemId: id,
        message: feedback,
        userId: userId,
        rating: rating,
        mealType: mealType,
    });
}

function chefMenu() {
    console.log('Chef operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       See menu            |');
    console.log('|    2     |       RollOut Menu        |');
    console.log('|    3     |       Finalized Menu      |');
    console.log('|    4     |       Discard Item List   |');
    console.log('|    5     |       Logout              |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                seeMenu();
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

async function finalizedMenu() {
    socket.emit('selectedMenu');
}
function discardItemList() {
    socket.emit('discardItemList');
}

socket.on('connect', () => {
    displayUserPortal();
});

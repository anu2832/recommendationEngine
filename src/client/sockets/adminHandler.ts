import { question, rl } from '../../utils/rl';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function adminMenu() {
    console.log('\nAdmin Operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       Modify Menu         |');
    console.log('|    2     |         Logout            |');
    console.log('---------------------------------------');
    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                modifyMenu();
                break;
            case '2':
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
    const id = await question('\nItem id ');
    const name = await question('Enter Name: ');
    const price = await question('Enter price: ');
    const availability = await question('Enter availability: ');
    const mealTime = await question('Enter mealTime: ');
    const diet_Category = await question('Enter dietType: ');
    const spice_level = await question('Enter spiceType: ');
    const area = await question('Enter region: ');
    const sweet_level = await question('Enter sweetDish: ');
    socket.emit('add_item', {
        id,
        name,
        price,
        availability,
        role,
        mealTime,
        diet_Category,
        spice_level,
        area,
        sweet_level
    });
}

async function deleteItem(role: string) {
    const itemId = await question('Item id ');
    socket.emit('delete_item', { itemId, role });
}



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

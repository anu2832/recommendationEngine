import { question, rl } from '../../utils/rl';
import { socket } from '../../utils/socket';
import { logOut } from './authHandler';

export function chefMenu() {
    console.log('Chef operations:');
    console.log('---------------------------------------');
    console.log('|  Option  |       Description         |');
    console.log('---------------------------------------');
    console.log('|    1     |       RollOut Menu        |');
    console.log('|    2     |       Finalized Menu      |');
    console.log('|    3     |       Discard Item List   |');
    console.log('|    4     |       Logout              |');
    console.log('---------------------------------------');

    rl.question('Choose an option: ', option => {
        switch (option) {
            case '1':
                menuRollOut();
                break;
            case '2':
                finalizedMenu();
                break;
            case '3':
                discardItemList();
                break;
            case '4':
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


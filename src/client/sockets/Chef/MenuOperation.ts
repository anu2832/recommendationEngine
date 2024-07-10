// import { question } from "../../../utils/rl";
// import { socket } from "../../../utils/socket";

// export const menuOperations = {
//     async menuRollOut() {
//         const menuType = await question('Rolled Out menu:');
//         socket.emit('create_rollout', { menuType: menuType });
//     },

//     async finalizedMenu() {
//         socket.emit('selectedMenu');
//     },

//     discardItemList() {
//         socket.emit('allDiscardedItems');
//     },

//     viewMenu() {
//         socket.emit('see_menu');
//     },

//     async modifyDiscardList() {
//         const choice = await question('Do you want to delete item from menu or discard list? (menu/discard)');
//         const id = await question('Enter the itemId for the above operation');

//         if (choice === 'menu' || choice === 'discard') {
//             socket.emit('modifyDiscardList', { choice, id });
//         } else {
//             console.log(`Invalid choice, Please enter "menu" or "dicard".`);
//             await this.modifyDiscardList();
//         }
//     }
// };

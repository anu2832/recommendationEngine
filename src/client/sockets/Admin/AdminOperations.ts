import { rl } from '../../../utils/rl';
import { AdminMenu } from './AdminMenu';
import { ItemOperations } from './ItemOperations';

class AdminOperations {
    private itemOperations;
    constructor() {
        this.itemOperations = new ItemOperations();
    }

    public modifyMenu() {
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
                    this.itemOperations.addItem('admin');
                    break;
                case '2':
                    this.itemOperations.updateItem('admin');
                    break;
                case '3':
                    this.itemOperations.deleteItem('admin');
                    break;
                case '4':
                    AdminMenu.display();
                    break;
                default:
                    console.log('Invalid option');
                    this.modifyMenu();
            }
        });
    }
}

const AdminOperationsInstance = new AdminOperations();
export { AdminOperations };
export default AdminOperationsInstance;

// import { rl } from '../../../utils/rl';
// import { AdminMenu } from './AdminMenu';
// import { ADMIN_CONSTANTS } from './Constant';
// import { ItemOperations } from './ItemOperations';

// class AdminOperations {
//     private itemOperations;
//     constructor() {
//         this.itemOperations = new ItemOperations();
//     }

//     public modifyMenu() {
//         console.log(ADMIN_CONSTANTS.menu.title);
//         console.log(ADMIN_CONSTANTS.menu.separator);
//         ADMIN_CONSTANTS.menu.options.forEach(option => console.log(option));
//         console.log(ADMIN_CONSTANTS.menu.separator);

//         rl.question(ADMIN_CONSTANTS.menu.chooseOptionPrompt, option => {
//             switch (option) {
//                 case '1':
//                     this.itemOperations.addItem('admin');
//                     break;
//                 case '2':
//                     this.itemOperations.updateItem('admin');
//                     break;
//                 case '3':
//                     this.itemOperations.deleteItem('admin');
//                     break;
//                 case '4':
//                     AdminMenu.display();
//                     break;
//                 default:
//                     console.log(ADMIN_CONSTANTS.menu.invalidOption);
//                     this.modifyMenu();
//             }
//         });
//     }
// }

// const AdminOperationsInstance = new AdminOperations();
// export { AdminOperations };
// export default AdminOperationsInstance;

import { rl } from '../../../utils/rl';
import { UserAuth } from '../auth/userAuth';
import AdminOperationsInstance from './AdminOperations';

export class AdminMenu {
    static display() {
        console.log('\nAdmin Operations:');
        console.log('---------------------------------------');
        console.log('|  Option  |       Description         |');
        console.log('---------------------------------------');
        console.log('|    1     |       Modify Menu         |');
        console.log('|    2     |         Logout            |');
        console.log('---------------------------------------');
        rl.question('Choose an option: ', (option: any) => {
            switch (option) {
                case '1':
                    AdminOperationsInstance.modifyMenu();
                    break;
                case '2':
                    UserAuth.logOut();
                    break;
                default:
                    console.log('Invalid option');
                    AdminMenu.display();
            }
        });
    }
}

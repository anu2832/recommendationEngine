import { rl } from '../../../utils/rl';
import { UserAuth } from '../auth/userAuth';
import AdminOperationsInstance from './AdminOperations';
import { ADMIN_CONSTANTS } from './Constant';

export class AdminMenu {
    static display() {
        console.log(`\n${ADMIN_CONSTANTS.adminMenu.title}`);
        console.log(ADMIN_CONSTANTS.adminMenu.separator);
        ADMIN_CONSTANTS.adminMenu.options.forEach(option =>
            console.log(option),
        );
        console.log(ADMIN_CONSTANTS.adminMenu.separator);

        rl.question(
            ADMIN_CONSTANTS.adminMenu.chooseOptionPrompt,
            (option: string) => {
                switch (option) {
                    case '1':
                        AdminOperationsInstance.modifyMenu();
                        break;
                    case '2':
                        UserAuth.logOut();
                        break;
                    default:
                        console.log(ADMIN_CONSTANTS.adminMenu.invalidOption);
                        AdminMenu.display();
                }
            },
        );
    }
}

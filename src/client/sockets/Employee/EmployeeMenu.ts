import { rl } from '../../../utils/rl';
import { UserAuth } from '../auth/userAuth';
import { EmployeeMenuHandlers } from './SocketHandler';
import { EMPLOYEE_MENU_CONSTANTS, EmployeeMenuOptions } from './constant';

export class EmployeeMenu {
    private handlers: EmployeeMenuHandlers;

    constructor(userId: string) {
        this.handlers = new EmployeeMenuHandlers(this);
    }

    public employeeMenu(userId: string) {
        console.log(EMPLOYEE_MENU_CONSTANTS.title);
        console.log(EMPLOYEE_MENU_CONSTANTS.separator);
        EMPLOYEE_MENU_CONSTANTS.options.forEach(option => console.log(option));
        console.log(EMPLOYEE_MENU_CONSTANTS.separator);

        rl.question(EMPLOYEE_MENU_CONSTANTS.chooseOptionPrompt, option => {
            switch (option) {
                case EmployeeMenuOptions.seeMenu:
                    this.handlers.seeMenu(userId);
                    break;
                case EmployeeMenuOptions.voteForMenu:
                    this.handlers.voteForMenu(userId);
                    break;
                case EmployeeMenuOptions.providingFeedback:
                    this.handlers.providingFeedback(userId);
                    break;
                case EmployeeMenuOptions.viewFeedbacks:
                    this.handlers.viewFeedbacks();
                    break;
                case EmployeeMenuOptions.viewNotification:
                    this.handlers.viewNotification(userId);
                    break;
                case EmployeeMenuOptions.makeProfile:
                    this.handlers.makeProfile(userId);
                    break;
                case EmployeeMenuOptions.ownRecipe:
                    this.handlers.ownRecipe(userId);
                    break;
                case EmployeeMenuOptions.logOut:
                    UserAuth.logOut();
                    break;
                default:
                    console.log(EMPLOYEE_MENU_CONSTANTS.invalidOption);
                    this.employeeMenu(userId);
            }
        });
    }
}

const EmployeeMenuInstance = (userId: string) => new EmployeeMenu(userId);
export default EmployeeMenuInstance;

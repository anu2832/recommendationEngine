import { rl } from '../../../utils/rl';
import { UserAuth } from '../auth/userAuth';
import { ChefMenuHandlers } from './ChefMenuHandler';
import { CHEF_MENU_CONSTANTS } from './constant';

export class ChefMenu {
    private handlers: ChefMenuHandlers;

    constructor() {
        this.handlers = new ChefMenuHandlers(this);
    }

    public chefMenu() {
        console.log(CHEF_MENU_CONSTANTS.title);
        console.log(CHEF_MENU_CONSTANTS.separator);
        CHEF_MENU_CONSTANTS.options.forEach(option => console.log(option));
        console.log(CHEF_MENU_CONSTANTS.separator);

        rl.question(CHEF_MENU_CONSTANTS.chooseOptionPrompt, option => {
            switch (option) {
                case '1':
                    this.handlers.viewMenu();
                    break;
                case '2':
                    this.handlers.menuRollOut();
                    break;
                case '3':
                    this.handlers.finalizedMenu();
                    break;
                case '4':
                    this.handlers.discardItemList();
                    break;
                case '5':
                    this.handlers.modifyDiscardList();
                    break;
                case '6':
                    this.handlers.seeFeedback();
                    break;
                case '7':
                    UserAuth.logOut();
                    break;
                default:
                    console.log(CHEF_MENU_CONSTANTS.invalidOption);
                    this.chefMenu();
            }
        });
    }
}

const chefMenuInstance = new ChefMenu();
export default chefMenuInstance;

import { rl } from '../../../utils/rl';
import { UserAuth } from '../auth/userAuth';
import { ChefMenuHandlers } from './ChefMenuHandler';

export class ChefMenu {
    private handlers: ChefMenuHandlers;

    constructor() {
        this.handlers = new ChefMenuHandlers(this);
    }

    public init() {
        console.log('Chef operations:');
        console.log('---------------------------------------');
        console.log('|  Option  |       Description         |');
        console.log('---------------------------------------');
        console.log('|    1     |   View Menu               |');
        console.log('|    2     |   RollOut Menu            |');
        console.log('|    3     |   Finalize Menu           |');
        console.log('|    4     |   List of Discarded items |');
        console.log('|    5     |   Modify Discard List     |');
        console.log('|    6     |   See feedback            |');
        console.log('|    7     |   Logout                  |');
        console.log('---------------------------------------');

        rl.question('Choose an option: ', option => {
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
                    console.log('Invalid option');
                    this.init();
            }
        });
    }
}

const chefMenuInstance = new ChefMenu();
export default chefMenuInstance;

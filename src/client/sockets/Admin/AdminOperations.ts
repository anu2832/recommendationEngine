import { rl } from '../../../utils/ReadLineInput';
import { AdminMenu } from './AdminMenu';
import itemOperationsInstance from './ItemOperations';

class AdminOperations {
    private itemOperations;
    constructor() {
        this.itemOperations = itemOperationsInstance;
        itemOperationsInstance.bindSocketEvents();
    }

    public modifyMenu() {
        console.log('Modify Menu : ' );
        console.log('---------------------------------------');
        console.log('|  Option  |       Description         |');
        console.log('---------------------------------------');
        console.log('|    1     |       Add Item            |');
        console.log('|    2     |       Update Item         |');
        console.log('|    3     |       Delete Item         |');
        console.log('|    4     |  Back to Admin Operations |');
        console.log('---------------------------------------');

        rl.question('Choose an option : ', option => {
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

import { question, rl } from '../../../utils/rl';
import { socket } from '../../../utils/socket';
import AdminOperationsInstance from './AdminOperations';

class ItemOperations {
    private socket;
    constructor() {
        this.socket = socket;
        this.socket.on(
            'add_item_response',
            this.handleAddItemResponse.bind(this),
        );
        this.socket.on(
            'delete_item_response',
            this.handleDeleteItemResponse.bind(this),
        );
        this.socket.on(
            'update_item_response',
            this.handleUpdateItemResponse.bind(this),
        );
    }

    async updateItem(role: string) {
        const id = await question('Enter item Id that will be updated: ');
        this.socket.emit('check_item_exists', { itemId: id });

        this.socket.once('check_item_exists_response', async response => {
            if (response.success && response.exists) {
                const availability = await question(
                    'Enter availability for the item: ',
                );
                this.socket.emit('update_item', {
                    itemId: id,
                    availability: availability,
                });
            } else {
                console.log('Item ID not found.');
                AdminOperationsInstance.modifyMenu();
            }
        });
    }

    async addItem(role: string) {
        const id = await question('\nItem id: ');
        const name = await question('Enter name of item: ');
        const price = await question('Enter price: ');
        const availability = await question('Enter availability: ');
        const mealTime = await question(
            'Enter type of meal (breakfast/lunch/dinner): ',
        );
        const diet_category = await question(
            'Enter diet type (veg/non-veg/eggetarian): ',
        );
        const spice_level = await question(
            'Enter spice level (low/medium/high): ',
        );
        const area = await question('Enter the region (north/south): ');
        const sweetDish = await question('Is it a sweet dish (yes/no): ');

        this.socket.emit('add_item', {
            id,
            name,
            price,
            availability,
            role,
            mealTime,
            diet_category,
            spice_level,
            area,
            sweetDish,
        });
    }

    async deleteItem(role: string) {
        const itemId = await question('Item id: ');
        this.socket.emit('delete_item', { itemId, role });
    }

    handleAddItemResponse(data: { success: any; message: string }) {
        if (data.success) {
            console.log('Item added successfully!');
            rl.question(
                'Do you want to add another item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.addItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        } else {
            console.log('Failed to add item: ' + data.message);
            rl.question(
                'Do you want to try again to add an item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.addItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        }
    }

    handleDeleteItemResponse(data: { success: any; message: string }) {
        if (data.success) {
            console.log('Item deleted successfully!');
            rl.question(
                'Do you want to delete another item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.deleteItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        } else {
            console.log('Failed to delete item: ' + data.message);
            rl.question(
                'Do you want to try again to delete an item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.deleteItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        }
    }

    handleUpdateItemResponse(data: { success: any; message: string }) {
        if (data.success) {
            console.log('Item updated successfully!');
            rl.question(
                'Do you want to update another item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.updateItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        } else {
            console.log('Failed to update item: ' + data.message);
            rl.question(
                'Do you want to try again to update an item? (yes/no): ',
                (answer: string) => {
                    if (answer.toLowerCase() === 'yes') {
                        this.updateItem('admin');
                    } else {
                        AdminOperationsInstance.modifyMenu();
                    }
                },
            );
        }
    }
}

const itemOperationsInstance = new ItemOperations();
export { ItemOperations };
export default itemOperationsInstance;

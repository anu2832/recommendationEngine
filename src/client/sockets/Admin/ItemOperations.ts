import { question, rl } from '../../../utils/ReadLineInput';
import { socket } from '../../../utils/socket';
import AdminOperationsInstance from './AdminOperations';
import {
    isValidPrice,
    isValidAvailability,
    isValidMealTime,
    isValidDietCategory,
    isValidSpiceLevel,
    isValidRegion,
    isValidSweetDish
} from './ItemValidations';

class ItemOperations {
    private socket;
    
    constructor() {
        this.socket = socket;
    }

    public bindSocketEvents(): void {
        this.socket.on(
            'add_item_response',
            (data: unknown) => this.handleAddItemResponse(data as { success: boolean; message: string })
        );
        this.socket.on(
            'delete_item_response',
            (data: unknown) => this.handleDeleteItemResponse(data as { success: boolean; message: string })
        );
        this.socket.on(
            'update_item_response',
            (data: unknown) => this.handleUpdateItemResponse(data as { success: boolean; message: string })
        );
    }

    async updateItem(role: string): Promise<void> {
        const id = await question('Enter item Id that will be updated: ');

        this.socket.emit('check_item_exists', { itemId: id });

        this.socket.once('check_item_exists_response', async (response: unknown) => {
            const typedResponse = response as { success: boolean; exists: boolean };
            if (typedResponse.success && typedResponse.exists) {
                const availability = await question('Enter availability for the item: ');

                if (isValidAvailability(availability as string)) {
                    this.socket.emit('update_item', {
                        itemId: id,
                        availability: availability,
                    });
                } else {
                    console.log('Invalid availability. Please enter "available" or "not available".');
                    this.updateItem(role);
                }
            } else {
                console.log('Item ID not found.');
                AdminOperationsInstance.modifyMenu();
            }
        });
    }

    async addItem(role: string): Promise<void> {
        const id = await question('\nItem id : ');
        const name = await question('Enter name of item : ');
        const price = await question('Enter price : ');
        const availability = await question('Enter availability : ');
        const mealTime = await question('Enter type of meal (breakfast/lunch/dinner) : ');
        const diet_category = await question('Enter diet type (veg/non-veg/eggetarian) : ');
        const spice_level = await question('Enter spice level (low/medium/high) : ');
        const area = await question('Enter the region (north/south) : ');
        const sweetDish = await question('Is it a sweet dish (yes/no) : ');

        // Use type assertions to ensure validation functions receive a string
        if (!isValidPrice(price as string)) {
            console.log('Invalid price. Please enter a positive number. \n');
            return this.addItem(role);
        }

        if (!isValidAvailability(availability as string)) {
            console.log('Invalid availability. Please enter "available" or "not available".\n');
            return this.addItem(role);
        }

        if (!isValidMealTime(mealTime as string)) {
            console.log('Invalid meal time. Please enter "breakfast", "lunch", or "dinner".\n');
            return this.addItem(role);
        }

        if (!isValidDietCategory(diet_category as string)) {
            console.log('Invalid diet category. Please enter "veg", "non-veg", or "eggetarian".\n');
            return this.addItem(role);
        }

        if (!isValidSpiceLevel(spice_level as string)) {
            console.log('Invalid spice level. Please enter "low", "medium", or "high".\n');
            return this.addItem(role);
        }

        if (!isValidRegion(area as string)) {
            console.log('Invalid region. Please enter "north" or "south".\n');
            return this.addItem(role);
        }

        if (!isValidSweetDish(sweetDish as string)) {
            console.log('Invalid input for sweet dish. Please enter "yes" or "no". \n');
            return this.addItem(role);
        }

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

    async deleteItem(role: string): Promise<void> {
        const itemId = await question('Item id : ');

        if (typeof itemId !== 'string') {
            console.log('Invalid item ID. It must be a string.');
            return;
        }

        if (!itemId.trim()) {
            console.log('Invalid item ID. It cannot be empty.');
            return this.deleteItem(role);
        }

        this.socket.emit('delete_item', { itemId, role });
    }

    handleAddItemResponse(data: { success: boolean; message: string }): void {
        if (data.success) {
            console.log('Item added successfully! \n');
            rl.question('Do you want to add another item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.addItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        } else {
            console.log('Failed to add item: ' + data.message);
            rl.question('Do you want to try again to add an item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.addItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        }
    }

    handleDeleteItemResponse(data: { success: boolean; message: string }): void {
        if (data.success) {
            console.log('Item deleted successfully! \n');
            rl.question('Do you want to delete another item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.deleteItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        } else {
            console.log('Failed to delete item: \n' + data.message);
            rl.question('Do you want to try again to delete an item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.deleteItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        }
    }

    handleUpdateItemResponse(data: { success: boolean; message: string }): void {
        if (data.success) {
            console.log('Item updated successfully! \n');
            rl.question('Do you want to update another item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.updateItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        } else {
            console.log('Failed to update item: \n ' + data.message);
            rl.question('Do you want to try again to update an item? (yes/no): ', (answer: string) => {
                if (answer.toLowerCase() === 'yes') {
                    this.updateItem('admin');
                } else {
                    AdminOperationsInstance.modifyMenu();
                }
            });
        }
    }
}

const itemOperationsInstance = new ItemOperations();
export { ItemOperations };
export default itemOperationsInstance;

export const ADMIN_CONSTANTS = {
    addItem: {
        id: '\nItem id: ',
        name: 'Enter name of item: ',
        price: 'Enter price: ',
        availability: 'Enter availability: ',
        mealTime: 'Enter type of meal (breakfast/lunch/dinner): ',
        dietCategory: 'Enter diet type (veg/non-veg/eggetarian): ',
        spiceLevel: 'Enter spice level (low/medium/high): ',
        area: 'Enter the region (north/south): ',
        sweetDish: 'Is it a sweet dish (yes/no): ',
    },
    updateItem: {
        id: 'Enter item Id that will be updated: ',
        availability: 'Enter availability for the item: ',
    },
    deleteItem: {
        id: 'Item id: ',
    },
    successMessages: {
        addItem: 'Item added successfully!',
        deleteItem: 'Item deleted successfully!',
        updateItem: 'Item updated successfully!',
    },
    failureMessages: {
        addItem: 'Failed to add item: ',
        deleteItem: 'Failed to delete item: ',
        updateItem: 'Failed to update item: ',
    },
    retryPrompt: 'Do you want to try again? (yes/no): ',
    menu: {
        title: 'Modify Menu:',
        separator: '---------------------------------------',
        options: [
            '|  Option  |       Description         |',
            '|    1     |       Add Item            |',
            '|    2     |       Update Item         |',
            '|    3     |       Delete Item         |',
            '|    4     |  Back to Admin Operations |',
        ],
        invalidOption: 'Invalid option',
        chooseOptionPrompt: 'Choose an option: ',
    },
    adminMenu: {
        title: 'Admin Operations:',
        separator: '---------------------------------------',
        options: [
            '|  Option  |       Description         |',
            '|    1     |       Modify Menu         |',
            '|    2     |         Logout            |',
        ],
        chooseOptionPrompt: 'Choose an option: ',
        invalidOption: 'Invalid option',
    },
};

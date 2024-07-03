//Interface representing feedback for a menu item
export interface Feedback {
    itemId: number;
    menuItemId: number;
    item: string;
    message: string;
    createdTime: Date;
    mealType: string;
}

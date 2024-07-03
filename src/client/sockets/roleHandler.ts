import { adminMenu } from './adminHandler';
import { displayUserPortal } from './authHandler';
import { chefMenu } from './chefHandler';
import { employeeMenu } from './employeeHandler';

//Manage activities based on user role.
export function manageRoleActivities(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            adminMenu();
            break;
        case 'employee':
            employeeMenu(userId);
            break;
        case 'chef':
            chefMenu();
            break;
        default:
            console.log('No operations defined for this role.');
            displayUserPortal();
    }
}

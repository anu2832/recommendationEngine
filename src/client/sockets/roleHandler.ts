import { AdminMenu } from './Admin/AdminMenu';
import chefMenuInstance from './Chef/ChefMenu';
import EmployeeMenuInstance from './Employee/EmployeeMenu';
import { UserPortal } from './auth/userPortal';

export function manageRoleActivities(role: string, userId: string) {
    console.log(`\nWelcome, ${role}`);
    switch (role) {
        case 'admin':
            AdminMenu.display();
            break;
        case 'employee':
            EmployeeMenuInstance(userId).employeeMenu(userId);
            break;
        case 'chef':
            chefMenuInstance.init();
            break;
        default:
            console.log('No operations defined for this role.');
            UserPortal.display();
    }
}

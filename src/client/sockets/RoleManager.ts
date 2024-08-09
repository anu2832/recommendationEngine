import { AdminMenu } from './admin/AdminMenu';
import chefMenuInstance from './chef/ChefMenu';
import EmployeeMenuInstance from './employee/EmployeeMenu';
import { UserPortal } from './auth/UserPortal';

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
            chefMenuInstance.chefMenu();
            break;
        default:
            console.log('No operations defined for this role.');
            UserPortal.display();
    }
}

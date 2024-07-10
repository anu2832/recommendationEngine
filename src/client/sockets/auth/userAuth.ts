import { rl } from '../../../utils/rl';
import { socket } from '../../../utils/socket';
import { manageRoleActivities } from '../roleHandler';
import { UserPortal } from './userPortal';

export class UserAuth {
    static login() {
        console.log('\nUser Login:');
        rl.question('| Enter Employee ID: ', (employeeId: string) => {
            rl.question('| Enter Name: ', (name: string) => {
                console.log(' Authenticating...');
                socket.emit('authenticate', { employeeId, name });
            });
        });
    }

    static logOut() {
        socket.emit('logout');
        rl.close();
    }

    static handleAuthResponse(data: {
        success: boolean;
        message: string;
        role?: string;
        userID: string;
    }) {
        console.log(data);
        if (data.success) {
            console.log('Login successful!');
            socket.emit('user_connected', data.userID);
            if (data.role) {
                manageRoleActivities(data.role, data.userID);
            }
        } else {
            console.log('Login failed: ' + data.message);
            UserPortal.display();
        }
    }

    static handleRegisterResponse(data: {
        success: boolean;
        message: string;
        role?: string;
        userId: string;
    }) {
        if (data.success) {
            console.log('Registration successful!');
            if (data.role) {
                manageRoleActivities(data.role, data.userId);
            }
        } else {
            console.log('Registration failed: ' + data.message);
            UserPortal.display();
        }
    }
}

import { rl } from '../../../utils/ReadLineInput';
import { socket } from '../../../utils/socket';
import { manageRoleActivities } from '../RoleManager';
import { USER_PORTAL_CONSTANTS } from './UserPortalConstants';
import { UserPortal } from './UserPortal';

export class UserAuth {
    static login() {
        console.log(`\n${USER_PORTAL_CONSTANTS.login.title} `);
        rl.question(
            USER_PORTAL_CONSTANTS.login.enterEmployeeId,
            (employeeId: string) => {
                rl.question(USER_PORTAL_CONSTANTS.enterName, (name: string) => {
                    console.log(USER_PORTAL_CONSTANTS.login.authenticating);
                    socket.emit('authenticate', { employeeId, name });
                });
            },
        );
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
        if (data.success) {
            console.log(USER_PORTAL_CONSTANTS.login.loginSuccessful);
            socket.emit('user_connected', data.userID);
            if (data.role) {
                manageRoleActivities(data.role, data.userID);
            }
        } else {
            console.log(USER_PORTAL_CONSTANTS.login.loginFailed + data.message);
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
            console.log(USER_PORTAL_CONSTANTS.register.registrationSuccessful);
            if (data.role) {
                manageRoleActivities(data.role, data.userId);
            }
        } else {
            console.log(
                USER_PORTAL_CONSTANTS.register.registrationFailed +
                    data.message,
            );
            UserPortal.display();
        }
    }
}

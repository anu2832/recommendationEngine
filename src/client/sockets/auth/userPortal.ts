import { rl } from '../../../utils/rl';
import { socket } from '../../../utils/socket';
import { USER_PORTAL_CONSTANTS } from './constant';
import { UserAuth } from './userAuth';

export class UserPortal {
    static display() {
        console.log(`\n${USER_PORTAL_CONSTANTS.title}`);
        console.log(USER_PORTAL_CONSTANTS.separator);
        USER_PORTAL_CONSTANTS.options.forEach(option => console.log(option));
        console.log(USER_PORTAL_CONSTANTS.separator);

        rl.question(
            USER_PORTAL_CONSTANTS.chooseOptionPrompt,
            (option: string) => {
                switch (option) {
                    case '1':
                        UserPortal.createNewUser();
                        break;
                    case '2':
                        UserAuth.login();
                        break;
                    default:
                        console.log(USER_PORTAL_CONSTANTS.invalidOption);
                        UserPortal.display();
                }
            },
        );
    }

    static createNewUser() {
        rl.question(USER_PORTAL_CONSTANTS.enterUserId, (employeeId: string) => {
            rl.question(USER_PORTAL_CONSTANTS.enterName, (name: string) => {
                rl.question(USER_PORTAL_CONSTANTS.enterRole, (role: string) => {
                    const userData = { employeeId, name, role };
                    socket.emit('register', userData);
                });
            });
        });
    }
}

// Socket event listeners
socket.on(
    'auth_response',
    (response: {
        success: boolean;
        message: string;
        role?: string;
        userID: string;
    }) => {
        UserAuth.handleAuthResponse(response);
    },
);

socket.on(
    'register_response',
    (response: {
        success: boolean;
        message: string;
        role?: string;
        userId: string;
    }) => {
        UserAuth.handleRegisterResponse(response);
    },
);

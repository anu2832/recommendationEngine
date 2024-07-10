import { rl } from '../../../utils/rl';
import { socket } from '../../../utils/socket';
import { UserAuth } from './userAuth';

export class UserPortal {
    constructor() {
        this.setUpSocketHandlers();
    }

    static display() {
        console.log('\nUser Portal:');
        console.log('---------------------------------------');
        console.log('|  Option  |           Description     |');
        console.log('---------------------------------------');
        console.log('|    1     |           Register        |');
        console.log('|    2     |            Login          |');
        console.log('---------------------------------------');

        rl.question('Choose an option: ', (option: string) => {
            switch (option) {
                case '1':
                    UserPortal.creatingNewUser();
                    break;
                case '2':
                    UserAuth.login();
                    break;
                default:
                    console.log('\nInvalid option');
                    UserPortal.display();
            }
        });
    }

    static creatingNewUser() {
        rl.question('Enter user ID: ', (employeeId: string) => {
            rl.question('Enter Name: ', (name: string) => {
                rl.question('Enter Role: ', (role: string) => {
                    socket.emit('register', { employeeId, name, role });
                });
            });
        });
    }

    private setUpSocketHandlers() {}
}

socket.on(
    'auth_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userID: string;
    }) => {
        UserAuth.handleAuthResponse(data);
    },
);

socket.on(
    'register_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userId: string;
    }) => {
        UserAuth.handleRegisterResponse(data);
    },
);

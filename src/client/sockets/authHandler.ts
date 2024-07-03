import { io } from 'socket.io-client';
import { rl } from '../../utils/rl';
import { manageRoleActivities } from './roleHandler';
import { socket } from '../../utils/socket';

// Displaying the user portal with options to register or login
export function displayUserPortal() {
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
                creatingNewUser();
                break;
            case '2':
                login();
                break;
            default:
                console.log('\nInvalid option');
                displayUserPortal();
        }
    });
}

//Prompt user for details and emit a registration event
function creatingNewUser() {
    rl.question('Enter user ID: ', (employeeId: string) => {
        rl.question('Enter Name: ', (name: string) => {
            rl.question('Enter Role: ', (role: string) => {
                socket.emit('register', { employeeId, name, role });
            });
        });
    });
}

// Prompt user for login details and emit an authentication event
function login() {
    console.log('\nUser Login:');
    rl.question('| Enter Employee ID: ', employeeId => {
        rl.question('| Enter Name: ', name => {
            console.log(' Authenticating...');
            socket.emit('authenticate', { employeeId, name });
        });
    });
}

// Emit a logout event
export function logOut() {
    console.log('inside');
    socket.emit('logout');
    rl.close();
}

// Handle authentication response from the server
socket.on(
    'auth_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userID: string;
    }) => {
        console.log(data);
        if (data.success) {
            console.log('Login successful!');
            socket.emit('user_connected', data.userID);
            if (data.role) {
                manageRoleActivities(data.role, data.userID);
            }
        } else {
            console.log('Login failed: ' + data.message);
            displayUserPortal();
        }
    },
);

// Handle registration response from the server
socket.on(
    'register_response',
    (data: {
        success: boolean;
        message: string;
        role?: string;
        userId: string;
    }) => {
        if (data.success) {
            console.log('Registration successful!');
            if (data.role) {
                manageRoleActivities(data.role, data.userId);
            }
        } else {
            console.log('Registration failed: ' + data.message);
            displayUserPortal();
        }
    },
);

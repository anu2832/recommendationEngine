import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// import { handleAuthEvents } from './controller/authentication';
import { AdminEventHandler } from './controller/Admin/adminEventHandler';
import { AuthEventHandler } from './controller/Auth/authEventHandler';
import { EmployeeEventHandler } from './controller/Employee/EmployeeEventHandler';
import { ChefEvents } from './controller/Chef/ChefEvents';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    // Create an instance of AdminEventHandler for each connection
    new AdminEventHandler(socket);
    new AuthEventHandler(socket);
    new EmployeeEventHandler(socket)

    // handleEmployeeEvents(socket);
    new ChefEvents(socket);
    // handleAuthEvents(socket);
});

// Start the server
server.listen(3000, () => {
    console.log('Connection established');
});

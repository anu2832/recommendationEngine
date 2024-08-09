import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AuthEventHandler } from './controller/AuthEventHandler';
import { EmployeeEventHandler } from './controller/EmployeeEventHandler';
import { ChefEvents } from './controller/ChefEventsHandler';
import { AdminEventHandler } from './controller/AdminEventHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    new AdminEventHandler(socket);
    new AuthEventHandler(socket);
    new EmployeeEventHandler(socket);
    new ChefEvents(socket);
});

server.listen(3000, () => {
    console.log('Connection established');
});

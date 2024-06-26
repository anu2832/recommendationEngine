import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { handleAuthEvents } from './controller/authentication';
import { handleChefEvents } from './controller/chef';
import { handleAdminEvents } from './controller/admin';
import { handleEmployeeEvents } from './controller/employee';
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handle socket connection
io.on('connection', socket => {
    handleAdminEvents(socket);
    handleEmployeeEvents(socket);
    handleChefEvents(socket);
    handleAuthEvents(socket);
});

// Start the server
server.listen(3000, () => {
    console.log('Connection established');
});

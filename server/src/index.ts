import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
    res.send('Hello World!');
});
    
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('a peer connected with ID: ' + socket.id);

    socket.on('create-room', () => {
        const roomId = Math.random().toString(36).substring(4, 8); // Generate a short random room ID with 4 characters
        socket.join(roomId);
        socket.emit('room-created', roomId);
    });

    socket.on('join-room', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) {
            socket.emit('room-not-found');
            return;
        }
        socket.join(roomId);
        socket.to(roomId).emit('peer-joined', socket.id);
    })
});

server.listen(process.env.PORT, () => {
    console.log(`Server ish running on port ${process.env.PORT} uwu`);
})
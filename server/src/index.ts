import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = createServer(app);

function generateRoomId(): string {
    // Listing the characters so we dont generate any weird characters :p
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    // only 4 characters so ish cleann
    for (let i = 0; i < 4; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

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
        const roomId = generateRoomId();
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
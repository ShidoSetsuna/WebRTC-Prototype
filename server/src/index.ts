import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = createServer(app);

type Room = {
    id: string;
    createdAt: Date;
    lastActivity: Date;
};

const rooms = new Map<string, Room>();
const ROOM_TTL_MS = 30 * 60 * 1000; // 30m

// Periodic cleanup of stale rooms  
setInterval(() => {
    const now = Date.now();
    for (const [id, room] of rooms.entries()) {
        if (now - room.lastActivity.getTime() > ROOM_TTL_MS) {
            rooms.delete(id);
            console.log(`Cleaned up stale room: ${id}`);
        }
    }
}, 60 * 1000);

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
        rooms.set(roomId, {
            id: roomId,
            createdAt: new Date(),
            lastActivity: new Date(),
        });
        socket.join(roomId);
        socket.emit('room-created', roomId);
    });

    socket.on('join-room', (roomId: string) => {
        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('room-not-found');
            return;
        }
        // Update activity timestamp
        room.lastActivity = new Date();
        socket.join(roomId);
        socket.to(roomId).emit('peer-joined', socket.id);
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server ish running on port ${process.env.PORT} uwu`);
})
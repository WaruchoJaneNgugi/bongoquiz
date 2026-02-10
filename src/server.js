// server.js - Fixed Version
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
});

// Store active rooms
const rooms = new Map();

// Helper to get or create room
const getOrCreateRoom = (roomId) => {
    if (!rooms.has(roomId)) {
        console.log(`🏠 Creating new room: ${roomId}`);
        rooms.set(roomId, {
            players: new Set(),
            cells: Array(12).fill().map((_, index) => ({
                id: index,
                value: index + 1,
                isRevealed: false,
                x: index % 4,
                y: Math.floor(index / 4)
            }))
        });
    }
    return rooms.get(roomId);
};

io.on('connection', (socket) => {
    console.log('👤 New client connected:', socket.id);

    // Join a room
    socket.on('join-game', ({ roomId, playerName }) => {
        console.log(`🎮 ${playerName || 'Anonymous'} joining room: ${roomId}`);

        socket.join(roomId);
        const room = getOrCreateRoom(roomId);

        // Add player to room
        room.players.add(socket.id);

        console.log(`📊 Room ${roomId} now has ${room.players.size} players`);

        // Send current game state to new player
        console.log(`🔄 Sending game state to new player in room ${roomId}`);
        socket.emit('game-state-update', {
            cells: room.cells,
            gameStatus: 'playing'
        });

        // Broadcast to other players in the room
        socket.to(roomId).emit('player-joined', {
            playerId: socket.id,
            playerCount: room.players.size,
            cells: room.cells
        });
    });

    // Handle cell click
    socket.on('cell-click', ({ roomId, cellId }) => {
        console.log(`🖱️ Cell ${cellId} clicked in room ${roomId} by ${socket.id}`);

        if (!rooms.has(roomId)) {
            console.log(`❌ Room ${roomId} doesn't exist`);
            return;
        }

        const room = rooms.get(roomId);

        // Update cell state in room
        if (room.cells[cellId] && !room.cells[cellId].isRevealed) {
            room.cells[cellId].isRevealed = true;

            console.log(`✅ Cell ${cellId} marked as revealed in room ${roomId}`);

            // Broadcast to ALL clients in the room (including sender)
            io.to(roomId).emit('cell-revealed', cellId);

            // Also send full game state update
            io.to(roomId).emit('game-state-update', {
                cells: room.cells,
                gameStatus: 'playing'
            });

            console.log(`📡 Broadcasted cell ${cellId} reveal to room ${roomId}`);
        }
    });

    // Handle game state request
    socket.on('request-game-state', ({ roomId }) => {
        console.log(`📋 ${socket.id} requested game state for room ${roomId}`);

        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            socket.emit('game-state-update', {
                cells: room.cells,
                gameStatus: 'playing'
            });
        } else {
            // Create a new room with default state
            const room = getOrCreateRoom(roomId);
            socket.emit('game-state-update', {
                cells: room.cells,
                gameStatus: 'playing'
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('👋 Client disconnected:', socket.id);

        // Remove player from all rooms
        rooms.forEach((room, roomId) => {
            if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                console.log(`➖ Removed ${socket.id} from room ${roomId}`);

                // Broadcast player left
                io.to(roomId).emit('player-left', {
                    playerId: socket.id,
                    playerCount: room.players.size
                });

                // Clean up empty rooms
                if (room.players.size === 0) {
                    rooms.delete(roomId);
                    console.log(`🗑️ Cleaned up empty room: ${roomId}`);
                }
            }
        });
    });

    // Ping to keep connection alive
    socket.on('ping', () => {
        socket.emit('pong');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Accessible at: http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready for connections`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down server...');
    io.close();
    server.close(() => {
        console.log('✅ Server shut down');
        process.exit(0);
    });
});
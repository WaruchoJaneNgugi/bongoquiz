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
            gameState: null,
            cells: Array(12).fill().map((_, index) => ({
                id: index,
                isRevealed: false,
                value: index + 1
            }))
        });
    }
    return rooms.get(roomId);
};
// server.js - Add this inside io.on('connection')
socket.on('request-game-state', ({ roomId }) => {
    console.log(`📋 ${socket.id} requested game state for room ${roomId}`);

    if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        if (room.gameState) {
            socket.emit('game-state-response', room.gameState);
        } else {
            // Send initial state if no game exists
            socket.emit('game-state-response', {
                cells: room.cells,
                gameStatus: 'idle',
                revealedCount: 0
            });
        }
    }
});

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

        // Send welcome message with current game state
        socket.emit('welcome', {
            message: `Welcome to room ${roomId}`,
            playerCount: room.players.size,
            gameState: room.gameState
        });

        // Broadcast to other players in the room
        socket.to(roomId).emit('player-joined', {
            playerId: socket.id,
            playerCount: room.players.size
        });

        // Send current game state to new player
        if (room.gameState) {
            console.log(`🔄 Sending existing game state to new player in room ${roomId}`);
            socket.emit('game-state-update', room.gameState);
        }
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
        if (room.cells[cellId]) {
            room.cells[cellId].isRevealed = true;

            // Calculate revealed count
            const revealedCount = room.cells.filter(cell => cell.isRevealed).length;

            // Create updated game state
            room.gameState = {
                cells: room.cells,
                gameStatus: revealedCount >= 12 ? 'completed' : 'playing',
                revealedCount: revealedCount
            };

            console.log(`🔄 Room ${roomId} updated: ${revealedCount} cells revealed`);

            // Broadcast to ALL clients in the room (including sender)
            io.to(roomId).emit('cell-revealed', cellId);

            // Also send full game state update
            io.to(roomId).emit('game-state-update', room.gameState);

            console.log(`📡 Broadcasted cell ${cellId} reveal to room ${roomId}`);
        }
    });

    // Handle game state update from client
    socket.on('game-state-update', ({ roomId, cells, gameStatus, revealedCount }) => {
        console.log(`📤 Client ${socket.id} updating game state for room ${roomId}`);

        if (rooms.has(roomId)) {
            const room = rooms.get(roomId);
            room.gameState = { cells, gameStatus, revealedCount };

            // Broadcast to other clients (excluding sender)
            socket.to(roomId).emit('game-state-update', room.gameState);
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
// // server.js - ES Module version
// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
//
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });
//
// // Serve static files from the parent directory if needed
// app.use(express.static('..'));
//
// io.on('connection', (socket) => {
//     console.log('New client connected:', socket.id);
//
//     socket.on('join-room', (roomId) => {
//         socket.join(roomId);
//         console.log(`Socket ${socket.id} joined room ${roomId}`);
//
//         // Notify others in the room
//         socket.to(roomId).emit('peer-connected', socket.id);
//
//         // Send list of existing peers
//         const room = io.sockets.adapter.rooms.get(roomId);
//         if (room) {
//             const peers = Array.from(room).filter(id => id !== socket.id);
//             socket.emit('existing-peers', peers);
//         }
//     });
//
//     socket.on('signal', ({ to, from, signal, roomId }) => {
//         console.log(`Signal from ${from} to ${to} in room ${roomId}`);
//         socket.to(to).emit('signal', { from, signal });
//     });
//
//     socket.on('broadcast', ({ roomId, message }) => {
//         socket.to(roomId).emit('broadcast', message);
//     });
//
//     socket.on('disconnect', () => {
//         console.log('Client disconnected:', socket.id);
//         // Notify all rooms this socket was in
//         socket.rooms.forEach(room => {
//             if (room !== socket.id) {
//                 socket.to(room).emit('peer-disconnected', socket.id);
//             }
//         });
//     });
// });
//
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//     console.log(`Signaling server running on port ${PORT}`);
//     console.log(`Connect your game to: http://localhost:${PORT}`);
// });
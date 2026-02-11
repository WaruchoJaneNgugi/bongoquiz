// socket-service.ts - OPTIMIZED
import { io, Socket } from 'socket.io-client';

// Configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
const CONNECTION_TIMEOUT = 3000;
const RECONNECTION_ATTEMPTS = 3;

// Create socket instance
let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: RECONNECTION_ATTEMPTS,
            reconnectionDelay: 1000,
            timeout: CONNECTION_TIMEOUT,
            forceNew: false, // Reuse connection
            autoConnect: true,
            withCredentials: false,
        });

        // Log connection events
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance?.id);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });
    }

    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};

// Quick connection check
export const checkConnection = (): boolean => {
    return socketInstance?.connected || false;
};
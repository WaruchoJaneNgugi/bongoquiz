// socketService.ts - Updated for multi-device support
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private roomId: string | null = null;
    private isConnecting: boolean = false;

    connect(roomId: string) {
        if (this.isConnecting && this.socket?.connected) return this.socket;

        this.roomId = roomId;
        this.isConnecting = true;

        // IMPORTANT: Use the same server URL for all devices
        // For testing on same network:
        // 1. Find your laptop's IP: ipconfig (Windows) or ifconfig (Mac/Linux)
        // 2. Replace with your actual IP
        const serverUrl = this.getServerUrl();

        console.log('🔌 Connecting to WebSocket server:', serverUrl);

        this.socket = io(serverUrl, {
            query: { roomId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000,
            forceNew: true,
            autoConnect: true,
            withCredentials: false
        });

        this.setupEventListeners();

        this.isConnecting = false;
        return this.socket;
    }

    private getServerUrl(): string {
        // For production, use your deployed server URL
        // For development:
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // On laptop - use localhost
            return 'http://localhost:3001';
        } else if (hostname === '192.168.1.100' || hostname.includes('192.168')) {
            // On mobile device - use laptop's IP
            // CHANGE THIS to your laptop's actual IP address
            return 'http://192.168.1.100:3001'; // Example: laptop's IP
        } else {
            // Fallback - try to determine automatically
            // const port = window.location.port || '5173';
            return `http://${hostname}:3001`;
        }
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket connected, ID:', this.socket?.id);
            console.log('📡 Connected to room:', this.roomId);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            console.log('Attempting to reconnect...');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔥 Socket connection error:', error.message);
            console.error('Error details:', error);

            // Try to reconnect after error
            setTimeout(() => {
                if (this.roomId && !this.socket?.connected) {
                    console.log('🔄 Attempting to reconnect...');
                    this.socket?.connect();
                }
            }, 2000);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
            // Rejoin room after reconnection
            if (this.roomId) {
                this.joinGame(this.roomId, `Player_${Date.now()}`);
            }
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('🔥 Reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('💥 Failed to reconnect');
        });
    }

    joinGame(roomId: string, playerName: string) {
        console.log(`🎮 Joining game: ${roomId} as ${playerName}`);
        this.socket?.emit('join-game', { roomId, playerName });
    }

    cellClicked(cellId: number) {
        console.log(`📡 Broadcasting cell click: ${cellId} in room ${this.roomId}`);
        this.socket?.emit('cell-click', {
            roomId: this.roomId,
            cellId
        });
    }

    requestGameState(roomId: string) {
        console.log(`📋 Requesting game state for room: ${roomId}`);
        this.socket?.emit('request-game-state', { roomId });
    }

    // Event listeners
    onCellRevealed(callback: (cellId: number) => void) {
        this.socket?.off('cell-revealed'); // Remove old listeners
        this.socket?.on('cell-revealed', callback);
    }

    onGameStateUpdate(callback: (gameState: any) => void) {
        this.socket?.off('game-state-update');
        this.socket?.on('game-state-update', callback);
    }

    onWelcome(callback: (data: any) => void) {
        this.socket?.off('welcome');
        this.socket?.on('welcome', callback);
    }

    onPlayerJoined(callback: (data: any) => void) {
        this.socket?.off('player-joined');
        this.socket?.on('player-joined', callback);
    }

    onGameStateResponse(callback: (gameState: any) => void) {
        this.socket?.off('game-state-response');
        this.socket?.on('game-state-response', callback);
    }

    disconnect() {
        console.log('🔌 Disconnecting socket');
        this.socket?.disconnect();
        this.socket = null;
        this.roomId = null;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocketId(): string | undefined {
        return this.socket?.id;
    }
}

export default new SocketService();
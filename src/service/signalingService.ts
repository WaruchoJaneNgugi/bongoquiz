// import { io, Socket } from 'socket.io-client';
//
// type MessageCallback = (message: any) => void;
//
// class SignalingService {
//     private socket: Socket | null = null;
//     private roomId: string = '';
//     private messageCallbacks: MessageCallback[] = [];
//
//     connect(roomId: string, onMessage?: MessageCallback) {
//         this.roomId = roomId;
//
//         // Connect to signaling server
//         // Note: You'll need a minimal signaling server for WebRTC
//         this.socket = io('http://localhost:3001', {
//             query: { roomId },
//             transports: ['websocket', 'polling']
//         });
//
//         if (onMessage) {
//             this.messageCallbacks.push(onMessage);
//         }
//
//         this.setupEventListeners();
//     }
//
//     private setupEventListeners() {
//         if (!this.socket) return;
//
//         this.socket.on('connect', () => {
//             console.log('✅ Connected to signaling server');
//             this.socket?.emit('join-room', this.roomId);
//         });
//
//         this.socket.on('signal', (data: any) => {
//             console.log('📡 Received signal from peer');
//             this.messageCallbacks.forEach(cb => cb({
//                 type: 'SIGNAL',
//                 data
//             }));
//         });
//
//         this.socket.on('peer-connected', (peerId: string) => {
//             console.log('👤 Peer connected:', peerId);
//             this.messageCallbacks.forEach(cb => cb({
//                 type: 'PEER_CONNECTED',
//                 peerId
//             }));
//         });
//
//         this.socket.on('peer-disconnected', (peerId: string) => {
//             console.log('👤 Peer disconnected:', peerId);
//             this.messageCallbacks.forEach(cb => cb({
//                 type: 'PEER_DISCONNECTED',
//                 peerId
//             }));
//         });
//
//         this.socket.on('disconnect', () => {
//             console.log('❌ Disconnected from signaling server');
//         });
//     }
//
//     // Send signal data to specific peer
//     sendSignal(to: string, signalData: any) {
//         this.socket?.emit('signal', {
//             to,
//             from: this.socket.id,
//             roomId: this.roomId,
//             signal: signalData
//         });
//     }
//
//     // Broadcast to all in room
//     broadcast(message: any) {
//         this.socket?.emit('broadcast', {
//             roomId: this.roomId,
//             message
//         });
//     }
//
//     disconnect() {
//         if (this.socket) {
//             this.socket.disconnect();
//             this.socket = null;
//         }
//         this.messageCallbacks = [];
//     }
//
//     getSocketId(): string | undefined {
//         return this.socket?.id;
//     }
// }
//
// export default new SignalingService();
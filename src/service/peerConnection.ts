// import SimplePeer from 'simple-peer';
//
// interface PeerMessage {
//     type: string;
//     [key: string]: any;
// }
//
// type MessageCallback = (message: PeerMessage) => void;
// type ConnectionCallback = (connected: boolean) => void;
//
// class PeerConnection {
//     private peer: SimplePeer.Instance | null = null;
//     private messageCallbacks: MessageCallback[] = [];
//     private connectionCallbacks: ConnectionCallback[] = [];
//     private peerId: string = '';
//     private signalData: any = null; // ADD THIS LINE - missing property
//
//     constructor() {
//         this.peerId = `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     }
//
//     // Initialize as initiator (host)
//     initAsInitiator() {
//         this.peer = new SimplePeer({
//             initiator: true,
//             trickle: false,
//             config: {
//                 iceServers: [
//                     { urls: 'stun:stun.l.google.com:19302' },
//                     { urls: 'stun:global.stun.twilio.com:3478' }
//                 ]
//             }
//         });
//
//         this.setupPeerEvents();
//         return this.peer;
//     }
//
//     // Initialize as receiver (joining peer)
//     initAsReceiver(signalData: any) {
//         this.peer = new SimplePeer({
//             initiator: false,
//             trickle: false,
//             config: {
//                 iceServers: [
//                     { urls: 'stun:stun.l.google.com:19302' },
//                     { urls: 'stun:global.stun.twilio.com:3478' }
//                 ]
//             }
//         });
//
//         this.setupPeerEvents();
//         this.signal(signalData);
//         return this.peer;
//     }
//
//     private setupPeerEvents() {
//         if (!this.peer) return;
//
//         this.peer.on('signal', (data: any) => {
//             console.log('📡 WebRTC signal:', data.type);
//             this.signalData = data; // Store signal data
//
//             // Emit through SignalingService (implement this method separately)
//             this.emitSignalData(data);
//         });
//
//         this.peer.on('connect', () => {
//             console.log('✅ P2P connection established');
//             this.connectionCallbacks.forEach(cb => cb(true));
//         });
//
//         this.peer.on('data', (data: any) => {
//             try {
//                 const message: PeerMessage = JSON.parse(data.toString());
//                 console.log('📥 Received data from peer:', message.type);
//                 this.messageCallbacks.forEach(cb => cb(message));
//             } catch (error) {
//                 console.error('Error parsing peer message:', error);
//             }
//         });
//
//         this.peer.on('close', () => {
//             console.log('❌ P2P connection closed');
//             this.connectionCallbacks.forEach(cb => cb(false));
//         });
//
//         this.peer.on('error', (err: any) => {
//             console.error('🔥 P2P error:', err);
//         });
//     }
//
//     // Send signal data via SignalingService
//     private emitSignalData(data: any) {
//         // This needs to be implemented to send data through SignalingService
//         // For now, we'll just log it
//         console.log('Signal data to send:', data);
//         this.signalData = data;
//     }
//
//     // Get stored signal data
//     getSignalData(): any {
//         return this.signalData;
//     }
//
//     // Receive signal data from other peer
//     signal(data: any) {
//         if (this.peer) {
//             console.log('📡 Applying signal data:', data.type || 'unknown');
//             this.peer.signal(data);
//         }
//     }
//
//     // Send game action to connected peer
//     sendGameAction(action: PeerMessage) {
//         if (this.peer && this.peer.connected) {
//             try {
//                 const data = JSON.stringify(action);
//                 this.peer.send(data);
//                 console.log('📤 Sent game action:', action.type);
//                 return true;
//             } catch (error) {
//                 console.error('Error sending game action:', error);
//                 return false;
//             }
//         } else {
//             console.warn('Cannot send: P2P not connected');
//             return false;
//         }
//     }
//
//     // Register message callback
//     onMessage(callback: MessageCallback) {
//         this.messageCallbacks.push(callback);
//     }
//
//     // Register connection status callback
//     onConnectionChange(callback: ConnectionCallback) {
//         this.connectionCallbacks.push(callback);
//     }
//
//     // Get peer ID
//     getPeerId(): string {
//         return this.peerId;
//     }
//
//     // Disconnect
//     disconnect() {
//         if (this.peer) {
//             this.peer.destroy();
//             this.peer = null;
//         }
//         this.messageCallbacks = [];
//         this.connectionCallbacks = [];
//         this.signalData = null;
//     }
//
//     // Check if connected
//     isConnected(): boolean {
//         return this.peer?.connected || false;
//     }
// }
//
// export default PeerConnection;
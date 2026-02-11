// pusher-service.ts
import Pusher from 'pusher-js';

const pusher = new Pusher('your-app-key', {
    cluster: 'your-cluster'
});

const channel = pusher.subscribe('bongo-game');
channel.bind('cell-revealed', (data: any) => {
    // Update local state
});
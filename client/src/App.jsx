import { useEffect, useState } from 'react';

import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', {
    extraHeaders: {
        Authorization: 'Bearer authorization_token_here',
    },
});
const App = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    console.log('Isconnected: ' + isConnected);
    return <div>App</div>;
};

export default App;

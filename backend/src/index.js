const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
const { join } = require('node:path');

if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    // create one worker per available core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({
            PORT: 3000 + i,
        });
    }
    // set up the adapter on the primary thread
    return setupPrimary();
}

async function startServer() {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {},
        adapter: createAdapter(),
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // app.get('/', async (req, res) => {
    //     return res.status(200).json({ message: 'Hello, world!' });
    // });

    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'));
    });

    const port = process.env.PORT;

    io.on('connection', (socket) => {
        console.log('User connection ' + socket.id);
        socket.on('chat message', (msg) => {
            io.emit('chat message', msg);
        });
        socket.on('disconnect', () => {
            console.log('User disconnect :' + socket.id);
        });
    });

    server.listen(port, () => {
        console.log(`server running at http://localhost:${port}`);
    });
}

startServer();

const cluster = require('cluster');
const http = require('http');
const { Server } = require('socket.io');
const numCPUs = require('os').cpus().length;
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
const express = require('express');
const { join } = require('node:path');

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const app = express();
    const httpServer = http.createServer(app);

    // setup sticky sessions
    setupMaster(httpServer, {
        loadBalancingMethod: 'least-connection',
    });

    // setup connections between the workers
    setupPrimary();

    // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
    // Node.js < 16.0.0
    cluster.setupMaster({
        serialization: 'advanced',
    });
    // Node.js > 16.0.0
    // cluster.setupPrimary({
    //   serialization: "advanced",
    // });

    httpServer.listen(3000, () => {
        console.log(`server running at http://localhost:${3000}`);
    });

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);
    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer);

    // use the cluster adapter
    io.adapter(createAdapter());

    // setup connection with the primary process
    setupWorker(io);
    app.get('/', (req, res) => {
        res.sendFile(join(__dirname, 'index.html'));
    });
    io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
            io.emit('chat message', msg);
        });
        console.log('User connection ' + socket.id);
        socket.on('disconnect', () => {
            console.log('User disconnect :' + socket.id);
        });
    });
}

const express = require('express');
const { Worker } = require('worker_threads');
const { fork } = require('child_process');
const port = 4000;
const app = express();

app.get('/non-blocking', (req, res) => {
    return res.send('Non blocking');
});

app.get('/fetch', (req, res) => {
    const worker = new Worker('./worker.js');
    worker.on('message', (data) => {
        return res.status(200).send(`Result: ${data}`);
    });
    worker.on('error', (err) => {
        return res.status(200).send(`Error: ${err.message}`);
    });
});

// Worker vẫn liên lạc với main thread(phù hợp các task dùng cpu), cách tối ưu là dùng child process nhưng sẽ tiêu tốn thêm tài nguyên
app.get('/blocking', (req, res) => {
    //! blocking all request after response successful
    let total = 0;
    for (let i = 0; i < 20_000_000_000; i++) {
        total++;
    }
    return res.status(200).send(`Result: ${total}`);

    // not blocking
    // const worker = new Worker('./workerCount.js');
    // worker.on('message', (data) => {
    //     return res.status(200).send(`Result: ${data}`);
    // });
    // worker.on('error', (err) => {
    //     return res.status(200).send(`Error: ${err.message}`);
    // });
});

app.get('/child', (req, res) => {
    const child = fork('child.js');
    child.send('get');
    child.on('exit', (code) => {
        console.log('Child process exited with a code of ' + code);
    });
    child.on('message', (message) => {
        return res.json(message);
    });
    child.on('error', (error) => {
        console.log(error);
    });
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

const { parentPort } = require('worker_threads');

async function fetchData() {
    const data = [];
    for (let i = 1; i <= 100; i++) {
        const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${i}`);
        const rs = await res.json();
        console.log(rs);
        data.push(rs);
    }
    return data;
}
fetchData().then((data) => parentPort.postMessage(data));

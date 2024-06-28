console.log('CHILD PROCESS CREATE', process.pid);
process.on('message', async (message) => {
    // throw new Error('CHILD Error');
    console.log(message);
    const rs = await fetchData();
    process.send(rs);
    setTimeout(process.exit, 2000);
});

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

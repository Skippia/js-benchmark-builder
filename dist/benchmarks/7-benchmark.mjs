import { createRequire } from 'node:module';
import autocannon from 'autocannon';
const require = createRequire(import.meta.url);
const usersData = require('./users.json');
const PORT = process.env.PORT;
function finishedBench(err, res) {
    console.log('Finished Bench', err, res);
}
function startBench() {
    const url = `http://localhost:${PORT}`;
    let requestNumber = 0;
    const instance = autocannon({
        url,
        connections: 20,
        duration: 30,
        headers: {
            'Content-Type': 'application/json',
        },
        requests: [
            {
                method: 'POST',
                path: '/user',
                setupRequest(request) {
                    console.log('Request Number: ', requestNumber + 1);
                    request.body = JSON.stringify(usersData[requestNumber]);
                    requestNumber++;
                    return request;
                },
            },
        ],
    }, finishedBench);
    autocannon.track(instance);
}
startBench();

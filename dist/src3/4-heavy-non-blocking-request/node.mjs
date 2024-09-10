// Node.js Request Handler
import http from 'node:http';
import { heavyNonBlockingTask } from '../shared/index.mjs';
export function run(port) {
    const server = http.createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/heavy-non-blocking') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(heavyNonBlockingTask()));
        }
    });
    server.listen(port, () => {
        console.log(`Node.js server running on http://localhost:${port}`);
    });
}

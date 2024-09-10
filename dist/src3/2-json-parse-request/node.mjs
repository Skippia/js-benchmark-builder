import http from 'node:http';
export function run(port) {
    const server = http.createServer((req, res) => {
        if (req.method === 'GET' && req.url === '/json-parse-request') {
            const data = JSON.parse('{"hello":"world","music":true,"number":42,"date":"2024-09-06T20:41:07.905Z"}');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        }
    });
    server.listen(port, () => {
        console.log(`Node.js server running on http://localhost:${port}`);
    });
}

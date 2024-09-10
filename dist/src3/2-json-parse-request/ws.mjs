import { App } from 'uWebSockets.js';
export function run(port) {
    const app = App();
    app.get('/json-parse-request', (res, _req) => {
        const data = JSON.parse('{"hello":"world","music":true,"number":42,"date":"2024-09-06T20:41:07.905Z"}');
        res.cork(() => {
            res.writeHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
        });
    }).listen(port, (token) => {
        if (token) {
            console.log(`Secret server running on http://localhost:${port}`);
        }
        else {
            console.log(`Failed to listen to port ${port}`);
        }
    });
}

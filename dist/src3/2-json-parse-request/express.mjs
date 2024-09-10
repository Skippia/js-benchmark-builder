import express from 'express';
export function run(port) {
    const app = express();
    app.get('/json-parse-request', (req, res) => {
        const data = JSON.parse('{"hello":"world","music":true,"number":42,"date":"2024-09-06T20:41:07.905Z"}');
        res.json(data);
    });
    app.listen(port, () => {
        console.log(`Express server running on http://localhost:${port}`);
    });
}

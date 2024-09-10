import express from 'express';
import { heavyNonBlockingTask } from '../shared/index.mjs';
export function run(port) {
    const app = express();
    app.get('/heavy-non-blocking', (req, res) => {
        res.json(heavyNonBlockingTask());
    });
    app.listen(port, () => {
        console.log(`Express server running on http://localhost:${port}`);
    });
}

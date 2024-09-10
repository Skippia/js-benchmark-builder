// Bun Request Handler
import { serve } from 'bun';
import { heavyBlockingTask } from '../shared/index.mjs';
const PORT = process.env.PORT;
export function run(port) {
    serve({
        port: PORT,
        fetch(req) {
            const url = new URL(req.url);
            if (url.pathname === '/heavy-blocking' && req.method === 'GET') {
                return new Response(JSON.stringify(heavyBlockingTask()), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
        },
    });
    console.log(`Bun server running on http://localhost:${PORT}`);
}

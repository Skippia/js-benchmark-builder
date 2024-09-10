import { serve } from 'bun';
import { AbstractTransport } from '../abstract-transport.js';
export class BunTransport extends AbstractTransport {
    port;
    constructor(port, mediator) {
        super(mediator);
        this.port = port;
    }
    async run() {
        this.mediator.context = await this.initBeforeServer();
        this.mediator.context.server = serve({
            port: this.port,
            fetch: async (req) => {
                const url = new URL(req.url);
                const method = req.method;
                if (this.mediator.targetMethod === method && this.mediator.targetPath === url.pathname) {
                    const result = await this.mediator.handleRequest(method === 'POST' && await req.json());
                    return new Response(JSON.stringify(result), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
                throw new Error('Endpoint not found');
            },
        });
        console.log(`Bun server running on http://localhost:${this.port}`);
        this.gracefulShutdown({
            closeServerCallback: () => this.mediator.context.server.stop(),
        });
    }
}

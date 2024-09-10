import { Buffer } from 'node:buffer';
import http from 'node:http';
import { AbstractTransport } from '../abstract-transport.js';
export class NodeTransport extends AbstractTransport {
    port;
    constructor(port, mediator) {
        super(mediator);
        this.port = port;
    }
    async run() {
        this.mediator.context = await this.initBeforeServer();
        this.mediator.context.server = http.createServer(async (req, res) => {
            if (this.mediator.targetMethod === req.method && this.mediator.targetPath === req.url) {
                const result = this.mediator.handleRequest(req.method === 'POST' && await this.getRequestBody(req));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            }
        });
        this.mediator.context.server.listen(this.port, () => {
            console.log(`Node.js server running on http://localhost:${this.port}`);
        });
        this.gracefulShutdown({
            closeServerCallback: () => new Promise((res) => {
                this.mediator.context.server.close((err) => {
                    if (!err) {
                        res();
                    }
                });
            }),
        });
    }
    getRequestBody(req) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => {
                const body = Buffer.concat(chunks).toString();
                resolve(JSON.parse(body));
            });
            req.on('error', err => reject(err));
        });
    }
}

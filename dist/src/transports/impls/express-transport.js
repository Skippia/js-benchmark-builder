import express from 'express';
import { AbstractTransport } from '../abstract-transport.js';
export class ExpressTransport extends AbstractTransport {
    port;
    constructor(port, mediator) {
        super(mediator);
        this.port = port;
    }
    async run() {
        const app = express();
        this.mediator.context = this.mediator.targetMethod === 'POST'
            ? await this.initBeforeServer([() => app.use(express.json())])
            : await this.initBeforeServer();
        // @ts-expect-error impossible to describe types
        app[this.mediator.targetMethod.toLowerCase()](this.mediator.targetPath, async (req, res) => {
            const result = await this.mediator.handleRequest(req.method === 'POST' && (req.body));
            res.send(result);
        });
        this.mediator.context.server = app.listen(this.port, () => {
            console.log(`Express.js server running on http://localhost:${this.port}`);
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
}

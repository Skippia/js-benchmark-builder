export class AbstractTransport {
    mediator;
    constructor(mediator) {
        this.mediator = mediator;
    }
    /**
     * @description Initialize context, run callbacks
     * before HTTP server will be initialized.
     */
    async initBeforeServer(callbacks) {
        return (await this.mediator.runHook('onInit', [() => {
                console.log(`[${this.mediator.transportType}] expects [${this.mediator.targetMethod}]: ${this.mediator.targetPath}`);
            }, ...(callbacks || [])]));
    }
    /**
     * @description Invoke logic related with graceful shutdown,
     * f.e close sockets, connections etc.
     * After it HTTP server will be stopped.
     */
    gracefulShutdown({ closeServerCallback }, callbacks) {
        process.on('SIGINT', async () => {
            console.log('ctrl + c');
            this.mediator.runHook('onClose');
            callbacks?.forEach(c => c());
            await closeServerCallback();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('kill');
            this.mediator.runHook('onClose');
            callbacks?.forEach(c => c());
            await closeServerCallback();
            process.exit(1);
        });
    }
}

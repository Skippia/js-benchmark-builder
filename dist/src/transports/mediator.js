export class Mediator {
    transportType;
    targetMethod;
    targetPath;
    run;
    hooks;
    context;
    constructor(mediatorProperties) {
        this.transportType = mediatorProperties.transportType;
        this.targetMethod = mediatorProperties.targetMethod;
        this.targetPath = mediatorProperties.targetPath;
        this.run = mediatorProperties.run;
        this.hooks = mediatorProperties.hooks;
        this.context = {};
    }
    async runHook(hookName, callbacks) {
        const hook = this.hooks[hookName];
        if (hook) {
            if (hookName === 'onInit') {
                return await hook(callbacks);
            }
            await hook();
        }
    }
    async handleRequest(payload) {
        // await this.runHook('onRequest')
        const result = this.run(payload, this.context);
        // await this.runHook('onFinish')
        return result;
    }
}

import type { Mediator } from './mediator'

export abstract class AbstractTransport {
  constructor(readonly mediator: Mediator) {}
  abstract run(): void
  async init() {
    return await this.mediator.runHook('onInit', [() => {
      console.log(`Server expects [${this.mediator.targetMethod}]: ${this.mediator.targetPath}`)
    }]) || {}
  }

  gracefulShutdown() {
    process.on('exit', () => {
      this.mediator.runHook('onClose')
      process.exit(0)
    })
    process.on('SIGHUP', () => {
      console.log('hang up')
      process.exit(0)
    })
    process.on('SIGINT', () => {
      console.log('ctrl + c')
      process.exit(0)
    })
    process.on('SIGTERM', () => {
      console.log('kill')
      process.exit(1)
    })
  }
}

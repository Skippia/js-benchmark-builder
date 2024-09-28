import process from 'node:process'
import type { Mediator } from './mediator'
import type { Context } from './types'

export abstract class AbstractTransport<T extends Record<string, unknown> = {}> {
  constructor(readonly mediator: Mediator<T>) {}
  /**
   * @description Start app
   */
  abstract run(): void
  /**
   * @description Initialize context, run callbacks
   * before HTTP server will be initialized.
   */
  async initBeforeServer(callbacks?: Function[]): Promise<Context<T>> {
    return (await this.mediator.runHook('onInit', [() => {
      console.log(`[${this.mediator.transportType}] expects [${this.mediator.targetMethod}]: ${this.mediator.targetPath}`)
    }, ...(callbacks || [])])) as Context<T>
  }

  /**
   * @description Invoke logic related with graceful shutdown,
   * f.e close sockets, connections etc.
   * After it HTTP server will be stopped.
   */
  gracefulShutdown({ closeServerCallback }: { closeServerCallback: () => Promise<void> | void }, callbacks?: Function[]) {
    console.log('[Hook]:', 'Configurate graceful shutdown...')

    process.on('SIGINT', async () => {
      // ('ctrl + c')
      console.log('Graceful shutdown intercepts SIGINT signal')

      this.mediator.runHook('onClose')
      callbacks?.forEach(c => c())
      await closeServerCallback()

      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('[Hook]:', 'Graceful shutdown intercepts SIGTERM signal')

      this.mediator.runHook('onClose')
      callbacks?.forEach(c => c())
      await closeServerCallback()

      process.exit(1)
    })
  }
}

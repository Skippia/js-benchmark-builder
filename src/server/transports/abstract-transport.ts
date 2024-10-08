import process from 'node:process'

import type { TContext, TFunction } from '../utils/types'

import type { Mediator } from './mediator'

export abstract class AbstractTransport<T extends Record<string, unknown> = {}> {
  constructor(readonly mediator: Mediator<T>) {}

  /**
   * @description Initialize context, run callbacks
   * before HTTP server will be initialized.
   */
  async initBeforeServer(callbacks?: TFunction[]): Promise<TContext<T>> {
    return (await this.mediator.runHook('onInit', { callbacks: [() => {
      console.log(`[${this.mediator.transport}] expects [${this.mediator.targetMethod}]: ${this.mediator.targetPath}`)
    }, ...(callbacks || [])] })) as TContext<T>
  }

  /**
   * @description Invoke logic related with graceful shutdown,
   * f.e close sockets, connections etc.
   * After it HTTP server will be stopped.
   */
  gracefulShutdown(closeServerCallback: () => Promise<void> | void, callbacks?: TFunction[]) {
    console.log('[Hook]:', 'Configurate graceful shutdown...')

    // eslint-disable-next-line ts/no-misused-promises
    process.on('SIGINT', async () => {
      // ('ctrl + c')
      console.log('[Hook][Child]: intercept SIGINT')

      await this.mediator.runHook('onClose', {})
      callbacks?.forEach(c => c())
      await closeServerCallback()

      console.log('[Hook][Child]: terminate process with code', 0)
      process.exit(0)
    })

    // eslint-disable-next-line ts/no-misused-promises
    process.on('SIGTERM', async () => {
      console.log('(3) [Hook][Child]: intercept SIGTERM')

      await this.mediator.runHook('onClose', {})
      callbacks?.forEach(c => c())
      await closeServerCallback()

      console.log('(5) [Hook][Child]: terminate process with code', 1)
      process.exit(1)
    })
  }

  /**
   * @description Start app
   */
  abstract run(): Promise<void> | void
}

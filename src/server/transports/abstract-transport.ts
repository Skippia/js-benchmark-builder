import process from 'node:process'

import type { TAsyncFunction, TContext, TSyncFunction } from '../utils/types'

import type { Mediator } from './mediator'

export abstract class AbstractTransport<T extends Record<string, unknown> = {}> {
  constructor(readonly mediator: Mediator<T>) {}

  /**
   * @description Initialize context, run callbacks
   * before HTTP server will be initialized.
   */
  async initBeforeServer(callbacks?: (TAsyncFunction | TSyncFunction)[]): Promise<TContext<T>> {
    console.log(`[${this.mediator.transport}] expects [${this.mediator.targetMethod}]: ${this.mediator.targetPath}`)

    for (const callback of (callbacks || [])) {
      await callback()
    }

    return (await this.mediator.runHook('onInit')) as TContext<T>
  }

  /**
   * @description Invoke logic related with graceful shutdown,
   * f.e close sockets, connections etc.
   * After it HTTP server will be stopped.
   */
  gracefulShutdown(closeServerCallback: () => Promise<void> | void, callbacks?: (TAsyncFunction | TSyncFunction)[]) {
    console.log('[Hook]:', 'Configurate graceful shutdown...')

    ;(['SIGINT', 'SIGTERM'] as const).forEach((signal: NodeJS.Signals) => {
      const exitCode = signal === 'SIGTERM' ? 1 : 0
      // eslint-disable-next-line ts/no-misused-promises
      process.on(signal, async () => {
        console.log(`[Hook][Child]: intercept ${signal}`)

        await this.mediator.runHook('onClose')

        for (const callback of (callbacks || [])) {
          await callback()
        }

        await closeServerCallback()

        console.log('[Hook][Child]: terminate process with code', exitCode)
        process.exit(exitCode)
      })
    })
  }

  /**
   * @description Start app
   */
  abstract run(): Promise<void> | void
}

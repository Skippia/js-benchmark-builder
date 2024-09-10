import type { Context, Hooks, MediatorProperties, TTransportTypeUnion } from './types'

export class Mediator<T extends Record<string, unknown>> implements MediatorProperties {
  transportType: TTransportTypeUnion
  targetMethod: 'GET' | 'POST'
  targetPath: string
  run: Function
  hooks: Hooks
  context: Context<T>

  constructor(
    mediatorProperties: MediatorProperties,
  ) {
    this.transportType = mediatorProperties.transportType
    this.targetMethod = mediatorProperties.targetMethod
    this.targetPath = mediatorProperties.targetPath
    this.run = mediatorProperties.run
    this.hooks = mediatorProperties.hooks
    this.context = {} as T
  }

  async runHook(hookName: keyof Hooks, callbacks?: Function[]): Promise<void | Context<T>> {
    const hook = this.hooks[hookName]

    if (hook) {
      if (hookName === 'onInit') {
        return await (hook as Function)(callbacks)
      }
      await (hook as Function)()
    }
  }

  async handleRequest(
    payload: false | unknown,
  ): Promise<unknown> {
    // await this.runHook('onRequest')

    const result = this.run(payload, this.context)

    // await this.runHook('onFinish')

    return result
  }
}

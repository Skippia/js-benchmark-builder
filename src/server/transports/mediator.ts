import type { TContext, THooks, TMediatorProperties, TRunFn, TTransportTypeUnion } from '../misc/types'

export class Mediator<T extends Record<string, unknown>> implements TMediatorProperties {
  transport: TTransportTypeUnion
  targetMethod: 'GET' | 'POST'
  targetPath: string
  run: TRunFn
  hooks: THooks
  context: TContext<T>

  constructor(
    mediatorProperties: TMediatorProperties,
  ) {
    this.transport = mediatorProperties.transport
    this.targetMethod = mediatorProperties.targetMethod
    this.targetPath = mediatorProperties.targetPath
    this.run = mediatorProperties.run
    this.hooks = mediatorProperties.hooks
    this.context = {} as T
  }

  async runHook(hookName: keyof THooks, callbacks?: Function[]): Promise<void | TContext<T>> {
    const hook = this.hooks[hookName]

    if (hook) {
      if (hookName === 'onInit') {
        return await (hook as Function)(callbacks)
      }
      await (hook as Function)()
    }
  }

  async _handleRequest(
    payload?: unknown,
  ): Promise<unknown> {
    // await this.runHook('onRequest')

    const result = this.run(payload, this.context)

    // await this.runHook('onFinish')

    return result
  }

  buildHandleRequestWrapper(getBody: (req: any) => Promise<unknown> | unknown) {
    return this.targetMethod === 'POST'
      ? async (req: any) => this._handleRequest(await getBody(req))
      : () => this._handleRequest()
  }
}

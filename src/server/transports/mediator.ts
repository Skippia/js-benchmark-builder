import type { TTransportTypeUnion } from '@shared/types'

import type { TContext, THookOptions, THooks, TMediatorProperties, TRunFn } from '../utils/types'

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

  hooksMap<TTransportRequest, TTransportResponse>(
    hook: THooks[keyof THooks],
    options?: THookOptions<TTransportRequest, TTransportResponse>,
  ) {
    return {
      onInit: () => (hook as Required<THooks>['onInit'])() as Promise<TContext<T>>,
      onRequest: () => (hook as Required<THooks>['onRequest'])(options?.req),
      onFinish: () => (hook as Required<THooks>['onFinish'])(options?.res),
      onClose: () => (hook as THooks['onClose'])(),
    } satisfies Record<keyof THooks, unknown>
  }

  async runHook<TTransportRequest, TTransportResponse>(
    hookName: keyof THooks,
    options?: THookOptions<TTransportRequest, TTransportResponse>,
  ): Promise<void | TContext<T>> {
    // Hook exists
    const hook = this.hooks[hookName]

    if (!hook) return

    if (hookName === 'onInit') return await this.hooksMap(hook, options)[hookName]()

    await this.hooksMap(hook, options)[hookName]()
  }

  async _handleRequest<TTransportRequest, TTransportResponse>(
    options: {
      payload?: unknown
      req: TTransportRequest
      res?: TTransportResponse
    },
  ): Promise<unknown> {
    const { payload, req, res } = options

    await this.runHook('onRequest', { req })

    const result = await this.run(payload, this.context)

    await this.runHook('onFinish', { res })

    return result
  }

  buildHandleRequestWrapper<TTransportRequest, TTransportResponse>(
    // eslint-disable-next-line ts/no-redundant-type-constituents
    getBody: (req: TTransportRequest) => (Promise<unknown> | unknown),
  ) {
    return this.targetMethod === 'POST'
      ? async ({ req, res }: {
        req: TTransportRequest
        res?: TTransportResponse
      }) => await this._handleRequest<TTransportRequest, TTransportResponse>({ payload: await getBody(req), req, res })
      : ({ req, res }: {
          req: TTransportRequest
          res?: TTransportResponse
        }) => this._handleRequest({ req, res })
  }
}

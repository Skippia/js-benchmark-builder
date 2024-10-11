import type { TTransportTypeUnion } from '@shared/types'

import type { TContext, TFunction, THooks, TMediatorProperties, TRunFn } from '../utils/types'

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

  async runHook<TTransportRequest, TTransportResponse>(
    hookName: keyof THooks,
    options: { req?: TTransportRequest, res?: TTransportResponse, callbacks?: TFunction[] },
  ): Promise<void | TContext<T>> {
    const hook = this.hooks[hookName]
    const { req, res, callbacks } = options

    if (!hook) return

    if (hookName === 'onInit') {
      return await (hook as Required<THooks>['onInit'])(callbacks) as TContext<T>
    }
    else if (hookName === 'onRequest') {
      await (hook as Required<THooks>['onRequest'])(req)
    }
    else if (hookName === 'onFinish') {
      await (hook as Required<THooks>['onFinish'])(res)
    }

    // eslint-disable-next-line ts/no-unnecessary-condition
    else if (hookName === 'onClose') {
      await (hook as THooks['onClose'])()
    }
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

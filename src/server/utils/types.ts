import type { TTransportTypeUnion } from '@shared/types'

type TContext<T extends Record<string, unknown> = {}> = Record<string, unknown> & T

type THooks = {
  onInit?: () => Promise<TContext> | TContext
  // eslint-disable-next-line ts/no-explicit-any
  onRequest?: (req: any) => Promise<void> | void
  // eslint-disable-next-line ts/no-explicit-any
  onFinish?: (res: any) => Promise<void> | void
  onClose: () => Promise<void> | void
}

type TSyncFunction = (...args: any[]) => unknown
type TAsyncFunction = (...args: any[]) => Promise<void>
type TRunFn = (_payload?: unknown, _context?: TContext) => Promise<unknown>

 type TUsecaseBuilder = {
   hooks: THooks
   run: TRunFn
 }

type TMediatorProperties = {
  transport: TTransportTypeUnion
  targetMethod: 'GET' | 'POST'
  targetPath: string
  hooks: THooks
  run: TRunFn
}

type THookOptions<TTransportRequest, TTransportResponse> =
  { req: TTransportRequest, res?: TTransportResponse } |
  { req?: TTransportRequest, res: TTransportResponse }

export type {
  TAsyncFunction,
  TContext,
  THookOptions,
  THooks,
  TMediatorProperties,
  TRunFn,
  TSyncFunction,
  TUsecaseBuilder,
}

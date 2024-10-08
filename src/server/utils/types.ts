const transports = ['node', 'bun', 'express', 'fastify', 'ws'] as const
const usecases = [
  'empty',
  'heavy-blocking',
  'heavy-non-blocking',
  //
  'pg-pool-create-user',
  'pg-pool-get-user',
  //
  'redis-create-user',
  'redis-get-user',
] as const

const usecaseMap: { [K in TUsecaseTypeUnion]: TUsecaseConfig<K> } = {
  'empty': {
    method: 'GET',
    path: '/empty',
  },
  'heavy-blocking': {
    method: 'GET',
    path: '/heavy-blocking',
  },
  'heavy-non-blocking': {
    method: 'GET',
    path: '/heavy-non-blocking',
  },
  // Postgres
  'pg-pool-create-user': {
    method: 'POST',
    path: '/pg-pool-create-user',
  },
  'pg-pool-get-user': {
    method: 'GET',
    path: '/pg-pool-get-user',
  },
  // Redis
  'redis-create-user': {
    method: 'POST',
    path: '/redis-create-user',
  },
  'redis-get-user': {
    method: 'GET',
    path: '/redis-get-user',
  },
} as const

type TUsecaseConfig<T extends string = string> = { method: 'GET' | 'POST', path: `/${T}` }
type TUsecaseTypeUnion = typeof usecases[number]
type TTransportTypeUnion = typeof transports[number]

/**
 * @description Config which we can get parsing CLI flags
 */
type TRuntimeSettings = {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number
}

type THostEnvironment = 'bun' | 'node'

type TContext<T extends Record<string, unknown> = {}> = Record<string, unknown> & T

type THooks = {
  onInit?: (callbacks?: TFunction[]) => Promise<TContext> | TContext
  onRequest?: <TReq>(req: TReq) => Promise<void>
  onFinish?: <TRes>(res: TRes) => Promise<void>
  onClose: () => Promise<void> | void
}

type TFunction = (...args: any[]) => unknown
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

export { transports, usecaseMap, usecases }
export type {
  TContext,
  TFunction,
  THooks,
  THostEnvironment,
  TMediatorProperties,
  TRunFn,
  TRuntimeSettings,
  TTransportTypeUnion,
  TUsecaseBuilder,
  TUsecaseConfig,
  TUsecaseTypeUnion,
}

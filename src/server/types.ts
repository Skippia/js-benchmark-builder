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

type THostEnvironment = 'bun' | 'node'

type Context<T extends Record<string, unknown> = {}> = {
  [key: string]: unknown
} & T

type Hooks = {
  onInit?: () => Promise<Context>
  onRequest?: (req: Request) => Promise<void>
  onFinish?: (res: Response) => Promise<void>
  onClose: () => Promise<void>
}

type MediatorProperties = {
  transport: TTransportTypeUnion
  targetMethod: 'GET' | 'POST'
  targetPath: string
  hooks: Hooks
  run: Function
}

export { transports, usecases, usecaseMap }
export type {
  TTransportTypeUnion,
  Context,
  Hooks,
  MediatorProperties,
  TUsecaseTypeUnion,
  TUsecaseConfig,
  THostEnvironment,
}

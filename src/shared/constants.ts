const TRANSPORTS = ['node', 'bun', 'express', 'fastify', 'ws'] as const

type TUsecaseTypeUnion = typeof USECASES[number]

const USECASES = [
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

type TTransportTypeUnion = typeof TRANSPORTS[number]

type TUsecaseConfig<T extends string = string> = { method: 'GET' | 'POST', path: `/${T}` }

const USECASE_MAP: { [K in TUsecaseTypeUnion]: TUsecaseConfig<K> } = {
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

const ALLOWED_FLAGS = ['u', 't', 'c', 'p', 'w', 'd', 'automate', 'cores'] as const

type TAllowedFlags = typeof ALLOWED_FLAGS[number]

export { ALLOWED_FLAGS, TRANSPORTS, USECASE_MAP, USECASES }
export type { TAllowedFlags, TTransportTypeUnion, TUsecaseConfig, TUsecaseTypeUnion }

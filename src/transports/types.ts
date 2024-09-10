export type TTransportType = 'node' | 'express' | 'fastify' | 'bun' | 'ws'
export type TUsecaseType
  = 'empty' | 'json-parse' | 'heavy-blocking' | 'heavy-non-blocking'
  | 'pg-pool-register' | 'cluster-json-parse' | 'cluster-heavy-blocking'
  | 'pg-get-user' | 'redis-get-user'

export type Context<T extends Record<string, unknown> = {}> = {
  [key: string]: unknown
} & T

export type Hooks = {
  onInit?: () => Promise<Context>
  onRequest?: (req: Request) => Promise<void>
  onFinish?: (res: Response) => Promise<void>
  onClose: () => Promise<void>
}

export type MediatorProperties = {
  transportType: TTransportType
  targetMethod: 'GET' | 'POST'
  targetPath: string
  hooks: Hooks
  run: Function
}

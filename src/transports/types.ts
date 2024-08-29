export type TTransportType = 'node' | 'express' | 'fastify' | 'bun' | 'ws'
export type TUsecaseType
  = 'empty' | 'json-parse' | 'heavy-blocking' | 'heavy-non-blocking'
  | 'pg-pool-register' | 'cluster-json-parse' | 'cluster-heavy-blocking'
  | 'pg-get-user' | 'redis-get-user'

export interface Context {
  dbPool?: any
  [key: string]: unknown
}

export interface Hooks {
  onInit?: () => Promise<Context>
  onRequest?: (req: Request) => Promise<void>
  onFinish?: (res: Response) => Promise<void>
  onClose?: () => Promise<void>
}

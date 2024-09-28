import { usecaseMap } from '../usecases/usecase-map'
import type { AbstractTransport } from './abstract-transport'
import { Mediator } from './mediator'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from './types'

const transportMap: Partial<Record<TTransportTypeUnion, () => Promise<new (port: number, mediator: Mediator<any>) => AbstractTransport<any>>>> = {
  node: () => import('./impls/node-transport').then(i => i.NodeTransport),
  express: () => import('./impls/express-transport').then(i => i.ExpressTransport),
  fastify: () => import('./impls/fastify-transport').then(i => i.FastifyTransport),
  bun: () => import('./impls/bun-transport').then(i => i.BunTransport),
  ws: () => import('./impls/ws-transport').then(i => i.WsTransport),
}

export async function buildTransport(config: { transportType: TTransportTypeUnion, usecaseType: TUsecaseTypeUnion, port: number }): Promise<AbstractTransport> {
  const { transportType, usecaseType, port } = config

  const { hooks, run } = (await import(`../usecases/${usecaseType}.js`))
  const usecaseConfig = usecaseMap[usecaseType]

  if (!usecaseConfig) {
    throw new Error('Usecase not found!')
  }

  const TransportImpl = await transportMap[transportType]!()
  const mediator = new Mediator<any>(
    { hooks, run, transportType, targetMethod: usecaseConfig.method, targetPath: usecaseConfig.path },
  )

  return new TransportImpl(
    port,
    mediator,
  )
}

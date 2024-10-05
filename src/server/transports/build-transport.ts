import { type TTransportTypeUnion, type TUsecaseTypeUnion, usecaseMap } from '../misc/types'
import type { AbstractTransport } from './abstract-transport'
import { Mediator } from './mediator'

const transportMap: Partial<Record<TTransportTypeUnion, () => Promise<new (port: number, mediator: Mediator<any>) => AbstractTransport<any>>>> = {
  node: () => import('./impls/node-transport').then(i => i.NodeTransport),
  express: () => import('./impls/express-transport').then(i => i.ExpressTransport),
  fastify: () => import('./impls/fastify-transport').then(i => i.FastifyTransport),
  bun: () => import('./impls/bun-transport').then(i => i.BunTransport),
  ws: () => import('./impls/ws-transport').then(i => i.WsTransport),
}

export async function buildTransport(config: { transport: TTransportTypeUnion, usecase: TUsecaseTypeUnion, port: number }): Promise<AbstractTransport> {
  const { transport, usecase, port } = config

  const { hooks, run } = (await import(`../usecases/${usecase}.js`))

  const usecaseConfig = usecaseMap[usecase]

  if (!usecaseConfig) {
    throw new Error('Usecase not found!')
  }

  const TransportImpl = await transportMap[transport]!()
  const mediator = new Mediator<any>(
    { hooks, run, transport, targetMethod: usecaseConfig.method, targetPath: usecaseConfig.path },
  )

  return new TransportImpl(
    port,
    mediator,
  )
}

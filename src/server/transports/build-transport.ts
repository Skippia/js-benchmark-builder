import { USECASE_MAP } from '@shared/constants'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from '@shared/types'

import type { AbstractTransport } from './abstract-transport'
import type { BunTransport } from './impls/bun-transport'
import type { ExpressTransport } from './impls/express-transport'
import type { FastifyTransport } from './impls/fastify-transport'
import type { NodeContextProperties, NodeTransport } from './impls/node-transport'
import type { WsTransport } from './impls/ws-transport'
import { Mediator } from './mediator'

type TTransportMap =
  Record<
    TTransportTypeUnion,
    () => Promise<
    typeof NodeTransport | typeof ExpressTransport | typeof FastifyTransport | typeof BunTransport | typeof WsTransport
    >
  >

type TAbstractTransportConstructor =
  new (port: number, mediator: Mediator<Record<string, unknown>>) =>
  AbstractTransport<Record<string, unknown>>

const transportMap: TTransportMap = {
  node: () => import('./impls/node-transport').then(i => i.NodeTransport),
  express: () => import('./impls/express-transport').then(i => i.ExpressTransport),
  fastify: () => import('./impls/fastify-transport').then(i => i.FastifyTransport),
  bun: () => import('./impls/bun-transport').then(i => i.BunTransport),
  ws: () => import('./impls/ws-transport').then(i => i.WsTransport),
}

export async function buildTransport(config: { transport: TTransportTypeUnion, usecase: TUsecaseTypeUnion, port: number }): Promise<AbstractTransport> {
  const { transport, usecase, port } = config

  const { hooks, run } = await import(`../usecases/${usecase}.js`)

  const usecaseConfig = USECASE_MAP[usecase]

  const TransportImpl = await transportMap[transport]() as TAbstractTransportConstructor

  const mediator = new Mediator<NodeContextProperties>(
    { hooks, run, transport, targetMethod: usecaseConfig.method, targetPath: usecaseConfig.path },
  )

  return new TransportImpl(
    port,
    mediator,
  )
}

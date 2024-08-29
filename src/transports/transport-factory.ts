import { usecaseMap } from '../usecases/usecase-map'
import { BunTransport } from './impls'
import { Mediator } from './mediator'
import type { AbstractTransport, TTransportType, TUsecaseType } from './types'

const transportMap: Partial<Record<TTransportType, new (port: number, mediator: Mediator) => AbstractTransport>> = {
  bun: BunTransport,
  // node: NodeTransport,
}

export class TransportFactory {
  static async createTransport(
    config: { transportType: TTransportType, usecaseType: TUsecaseType, port: number },
  ): Promise<AbstractTransport> {
    const { transportType, usecaseType, port } = config

    const { hooks, run } = (await import(`../usecases/${usecaseType}`))
    const usecaseConfig = usecaseMap[usecaseType]

    if (!usecaseConfig) {
      throw new Error('Usecase not found!')
    }

    const TransportImpl = transportMap[transportType]!
    const mediator = Mediator.initialize({ hooks, run, ...usecaseConfig })

    return new TransportImpl(
      port,
      mediator,
    )
  }
}

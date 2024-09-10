import { usecaseMap } from '../usecases/usecase-map.js'
import { Mediator } from './mediator.js'

const transportMap = {
  bun: () => import('./impls/bun-transport.js').then(i => i.BunTransport),
  node: () => import('./impls/node-transport.js').then(i => i.NodeTransport),
  express: () => import('./impls/express-transport.js').then(i => i.ExpressTransport),
}
export async function buildTransport(config) {
  const { transportType, usecaseType, port } = config
  const { hooks, run } = (await import(`../usecases/${usecaseType}.js`))
  const usecaseConfig = usecaseMap[usecaseType]
  if (!usecaseConfig) {
    throw new Error('Usecase not found!')
  }
  const TransportImpl = await transportMap[transportType]()
  const mediator = new Mediator({ hooks, run, transportType, targetMethod: usecaseConfig.method, targetPath: usecaseConfig.path })
  return new TransportImpl(port, mediator)
}

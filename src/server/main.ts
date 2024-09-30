import cluster from 'node:cluster'
import { getFlagValue } from '../benchmarks/utils'
import { type TTransportTypeUnion, type TUsecaseTypeUnion, buildTransport } from './transports'

const [transport, usecase, cores] = [
  getFlagValue('t') as TTransportTypeUnion,
  getFlagValue('u') as TUsecaseTypeUnion,
  +getFlagValue('cores')! as number,
]

export async function buildServer(
  { transport, usecase, cores }:
  { transport: TTransportTypeUnion, usecase: TUsecaseTypeUnion, cores: number },
) {
  const port = Number(process.env.PORT || 3001)

  const framework = await buildTransport(
    { transport, usecase, port },
  )

  if (cluster.isPrimary) {
    console.log(`Server will be run on ${cores} logical cores`)

    for (let i = 0; i < cores; i++) {
      cluster.fork()
    }

    // cluster.on('exit', (worker) => {
    //   console.log(`Process ${worker.process.pid} died`)
    // })
  }
  else {
    framework.run()
  }
}

buildServer({ transport, usecase, cores })

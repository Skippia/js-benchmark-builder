import cluster from 'node:cluster'
import process from 'node:process'
import { getFlagValue } from '../benchmarks/utils'
import { type TTransportTypeUnion, type TUsecaseTypeUnion, buildTransport } from './transports'

function configureMasterGracefulShutdown() {
  process.on('SIGINT', () => {
    console.log('Master process received SIGINT. Sending SIGINT to all workers.')

    // Send SIGINT to all workers
    for (const id in cluster.workers) {
      if (cluster.workers[id]) {
        cluster.workers[id].process.kill('SIGINT')
      }
    }
  })
}
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
    configureMasterGracefulShutdown()
    console.log(`Server will be run on ${cores} logical cores`)

    for (let i = 0; i < cores; i++) {
      cluster.fork()
    }

    let workersExited = 0

    cluster.on('exit', (_worker, _code, _signal) => {
      workersExited++
      if (workersExited === cores) {
        console.log('All workers have exited. Exiting master process.')
        process.exit(0)
      }
    })
  }
  else {
    framework.run()
  }
}

buildServer({ transport, usecase, cores })

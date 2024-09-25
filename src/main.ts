import cluster from 'node:cluster'
import { type TTransportTypeUnion, type TUsecaseTypeUnion, buildTransport } from './transports'

const transportType = process.argv[2] as TTransportTypeUnion
const usecaseType = process.argv[3] as TUsecaseTypeUnion
const cpuAmount = Number(process.argv[4] as string)

export async function buildServer(
  { transportType, usecaseType, cpuAmount }:
  { transportType: TTransportTypeUnion, usecaseType: TUsecaseTypeUnion, cpuAmount: number },
) {
  const port = Number(process.env.PORT || 3001)

  const transport = await buildTransport(
    { transportType, usecaseType, port },
  )

  if (cluster.isPrimary) {
    console.log(`Server will be run on ${cpuAmount} logical cores`)

    for (let i = 0; i < cpuAmount; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker) => {
      console.log(`Process ${worker.process.pid} died`)
    })
  }
  else {
    transport.run()
  }
}

buildServer({ transportType, usecaseType, cpuAmount })

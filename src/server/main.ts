import cluster from 'node:cluster'
import process from 'node:process'

import { getRuntimeSettings } from '@shared/helpers'
import type { TRuntimeSettings } from '@shared/types'

import { buildTransport } from './transports'
import { configureCascadeChildGracefulShutdown } from './utils/helpers'

const buildServer = async (
  { transport, usecase, cores }: TRuntimeSettings,
) => {
  const port = Number(process.env.PORT || 3001)

  const framework = await buildTransport(
    { transport, usecase, port },
  )

  if (cluster.isPrimary) {
    configureCascadeChildGracefulShutdown()

    console.log(`Server will be run on ${cores} logical cores`)

    for (let i = 0; i < cores; i++) {
      cluster.fork()
    }

    let workersExited = 0

    cluster.on('exit', (_worker, _code, _signal) => {
      workersExited++
      if (workersExited === cores) {
        console.log('All workers have exited. Exiting master process of server.')
        process.exit(0)
      }
    })
  }
  else {
    await framework.run()
  }
}

void buildServer(getRuntimeSettings())

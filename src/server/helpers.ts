import cluster from 'node:cluster'
import process from 'node:process'
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

import { type TRuntimeSettings, getFlagValue } from '../benchmarks/utils'
import type { THostEnvironment, TTransportTypeUnion, TUsecaseTypeUnion } from './types'

/**
 * @description GS for parent process
 */
export const configureCascadeMasterGracefulShutdownOnSignal = (childServerProcessRef: { value: ChildProcessWithoutNullStreams | null }, signal: Parameters<typeof process.on>[0] & NodeJS.Signals) => {
  setInterval(() => {
    console.log('child process still exist?...', childServerProcessRef?.value?.pid)
  }, 500)

  process.on(signal, () => {
    const exitCode = signal === 'SIGTERM' ? 1 : 0

    console.log(`Intercepts ${signal}...`)

    if (childServerProcessRef.value?.pid) {
      console.log(`Child process exists: ${childServerProcessRef.value.pid}...Kill it...`)

      process.kill(childServerProcessRef.value.pid!, signal)
      childServerProcessRef.value.on('close', () => {
        process.exit(exitCode)
      })
    }
    else {
      console.log('There is not child process. Kill only this one')
      process.exit(exitCode)
    }
  })
}

/**
 * @description GS for master process in child process
 */
export const configureCascadeChildGracefulShutdownOnSignal = (signal: Parameters<typeof process.on>[0] & NodeJS.Signals) => {
  process.on(signal, () => {
    console.log(`Master process received ${signal}. Sending ${signal} to all workers.`)

    // Send SIGINT to all workers
    for (const id in cluster.workers) {
      if (cluster.workers[id]) {
        cluster.workers[id].process.kill(signal)
      }
    }
  })
}

export const runServerInChildProcess = (
  hostEnvironment: THostEnvironment,
  transport: TTransportTypeUnion,
  usecase: TUsecaseTypeUnion,
  cores: number,
) => {
  const childProcess = spawn(hostEnvironment, [
    './dist/server/main.js',
    '-t',
    transport,
    '-u',
    usecase,
    '-cores',
    String(cores),
  ], {
    detached: true,
  })

  console.log('Spawn new child process:', childProcess.pid)

  return childProcess
}

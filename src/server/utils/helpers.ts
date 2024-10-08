import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import cluster from 'node:cluster'
import { cpus } from 'node:os'
import process from 'node:process'

import { getFlagValue } from '../../benchmarks/utils/helpers'
import type { TAutomateConfig } from '../../benchmarks/utils/types'

import type { ServerProcessManager } from './server-process-manager'
import type { THostEnvironment, TRuntimeSettings, TTransportTypeUnion, TUsecaseTypeUnion } from './types'

/**
 * @description GS for parent process
 */
export const configureCascadeMasterGracefulShutdown = (childProcessManagerRef: { value: ServerProcessManager | null }) => {
  const signals = ['SIGINT', 'SIGTERM'] as const

  signals.forEach((signal) => {
    process.on(signal, () => {
      const exitCode = signal === 'SIGTERM' ? 1 : 0

      if (childProcessManagerRef.value?.isRunning) {
        (childProcessManagerRef.value.childProcess as ChildProcessWithoutNullStreams).on('close', () => {
          process.exit(exitCode)
        })

        childProcessManagerRef.value.stop(signal)
      }
      else {
        console.log('No child process running. Exiting parent process.')
        process.exit(exitCode)
      }
    })
  })
}

/**
 * @description GS for master process in child process
 */
export const configureCascadeChildGracefulShutdown = () => {
  const signals = ['SIGINT', 'SIGTERM'] as const

  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`(2) Master process of server received ${signal}. Sending ${signal} to all workers (amount = ${(Object.keys(cluster.workers || ({} as NodeJS.Dict<Worker>))).length}). `)

      // Send SIGINT to all workers
      for (const id in cluster.workers) {
        if (cluster.workers[id]) {
          process.kill(cluster.workers[id].process.pid as number, signal)
        }
      }
    })
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

const convertCLICoresOptionToRealCores = (cores: number | 'max' | undefined): number =>
  cores === 'max'
    ? cpus().length
    : typeof cores === 'undefined'
      ? 1
      : Number(cores)

const getRuntimeSettings = (): TRuntimeSettings => ({
  transport: getFlagValue('t') as TTransportTypeUnion,
  usecase: getFlagValue('u') as TUsecaseTypeUnion,
  cores: convertCLICoresOptionToRealCores(getFlagValue('cores') as number | 'max' | undefined),
})

const buildOperations = ({
  usecases,
  transports,
  cores,
}: TAutomateConfig['runtimeSettings']) => usecases.flatMap(usecase =>
  transports.flatMap(transport =>
    cores.map(_cores => ({
      transport,
      usecase,
      cores: convertCLICoresOptionToRealCores(_cores),
    }) satisfies TRuntimeSettings),
  ),
)

export {
  buildOperations,
  convertCLICoresOptionToRealCores,
  getRuntimeSettings,
}

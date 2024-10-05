/* eslint-disable no-async-promise-executor */
import cluster from 'node:cluster'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { startBenchmark } from '../../benchmarks/benchmark'
import { type TDefaultSettings, type TRuntimeSettings, updateBenchmarkInfo } from '../../benchmarks/utils'
import { startEntrypoint } from '../entrypoint'
import type { ServerProcessManager } from './server-process-manager'
import { type THostEnvironment, type TTransportTypeUnion, type TUsecaseTypeUnion, usecaseMap } from './types'

/**
 * @description GS for parent process
 */
export const configureCascadeMasterGracefulShutdown = (childProcessManagerRef: { value: ServerProcessManager | null }) => {
  const signals = ['SIGINT', 'SIGTERM'] as const

  signals.forEach((signal) => {
    process.on(signal, () => {
      const exitCode = signal === 'SIGTERM' ? 1 : 0

      if (childProcessManagerRef.value?.isRunning) {
        childProcessManagerRef.value?.childProcess!.on('close', () => {
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
      console.log(`Master process of server received ${signal}. Sending ${signal} to all workers (amount = ${cluster.workers?.length || 0}). `)

      // Send SIGINT to all workers
      for (const id in cluster.workers) {
        if (cluster.workers[id]) {
          cluster.workers[id].process.kill(signal)
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

export const runScript = async (
  defaultSettings: TDefaultSettings,
  operation: TRuntimeSettings,
  pathToLastSnapshotFile: string,
  currentChildProcessManagerRef: { value: ServerProcessManager | null },
): Promise<void> => {
  return new Promise(async (resolve) => {
    // 1. Run server & and hold reference to the actual child process
    currentChildProcessManagerRef.value = await startEntrypoint({
      cores: operation.cores,
      transport: operation.transport,
      usecase: operation.usecase,
    })

    currentChildProcessManagerRef.value!.on('close', (_code) => {
      // Server process was terminated
      return resolve()
    })

    // 2. Run benchmark & collect data
    const benchmarkResult = await startBenchmark({
      connections: defaultSettings.connections,
      pipelining: defaultSettings.pipelining,
      workers: defaultSettings.workers,
      duration: defaultSettings.duration,
      usecaseConfig: usecaseMap[operation.usecase]!,
      transport: operation.transport,
      usecase: operation.usecase,
    })

    // 3. Save benchmark data on disk
    await updateBenchmarkInfo(pathToLastSnapshotFile, benchmarkResult)

    // 4. Stop server
    currentChildProcessManagerRef.value.stop('SIGTERM')
  })
}

/* eslint-disable no-async-promise-executor */
import type { spawn } from 'node:child_process'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../server/transports'
import { usecaseMap } from '../server/usecases/usecase-map'
import { startEntrypoint } from '../server/entrypoint'
import { buildOperations, logAfterBenchmark, logBeforeBenchmark, prepareToBenchmarkFileOnDisk, sleep, updateBenchmarkInfo } from './utils'
import type { TDefaultSettings, TRuntimeSettings } from './utils'
import { startBench } from './benchmark.js'

const transports: TTransportTypeUnion[] = ['node', 'bun', 'express', 'fastify', 'ws']
const usecases: TUsecaseTypeUnion[] = Object.keys(usecaseMap).slice(0, 3) as TUsecaseTypeUnion[]

const runScript = async (
  defaultSettings: TDefaultSettings,
  operation: TRuntimeSettings,
  pathToStorage: string,
): Promise<void> => {
  return new Promise(async (resolve) => {
    // 1. Run server
    const readyServerProcess = await startEntrypoint({
      cpuAmount: defaultSettings.core,
      transportType: operation.transport,
      usecaseType: operation.usecase,
    }) as ReturnType<typeof spawn>

    readyServerProcess.on('close', (_code) => {
      // Server process was terminated
      return resolve()
    })

    // 2. Run benchmark & collect data
    const benchmarkResult = await startBench({
      connections: defaultSettings.connections,
      pipelining: defaultSettings.pipelining,
      workers: defaultSettings.workers,
      duration: defaultSettings.duration,
      usecaseConfig: usecaseMap[operation.usecase]!,
      transport: operation.transport,
      usecase: operation.usecase,
    })

    // 3. Save benchmark data on disk
    await updateBenchmarkInfo(pathToStorage, benchmarkResult)

    // 4. Stop server
    process.kill(-readyServerProcess.pid!, 'SIGTERM')
  })
}

const start = async ({ defaultSettings, operations }: { defaultSettings: TDefaultSettings, operations: TRuntimeSettings[] }) => {
  // Write info about default settings related with benchmark
  const pathToStorage = await prepareToBenchmarkFileOnDisk(defaultSettings)

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]!

    logBeforeBenchmark(defaultSettings, operation, i, operations.length)

    // Run benchmark test
    await runScript(defaultSettings, operation, pathToStorage)

    logAfterBenchmark(defaultSettings)

    if (i !== (operations.length - 1)) {
      await sleep(defaultSettings?.delayBeforeRunning || 10)
    }
  }
}

start(
  {
    defaultSettings: { core: 1, workers: 3, delayBeforeRunning: 10, duration: 600, connections: 100, pipelining: 1 },
    operations: buildOperations(usecases, transports),
  },
)

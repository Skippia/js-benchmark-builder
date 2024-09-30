/* eslint-disable no-async-promise-executor */
import type { spawn } from 'node:child_process'
import { transports } from '../server/transports'
import { usecaseMap, usecases } from '../server/usecases/usecase-map.js'
import { startEntrypoint } from '../server/entrypoint'
import { buildOperations, logAfterBenchmark, logBeforeBenchmark, logCompleteBenchmark, prepareToBenchmarkFileOnDisk, sleep, updateBenchmarkInfo } from './utils'
import type { TDefaultSettings, TRuntimeSettings } from './utils'
import { startBench } from './benchmark.js'

const runScript = async (
  defaultSettings: TDefaultSettings,
  operation: TRuntimeSettings,
  pathToStorage: string,
): Promise<void> => {
  return new Promise(async (resolve) => {
    // 1. Run server
    const childServerProcess = await startEntrypoint({
      cores: operation.cores,
      transport: operation.transport,
      usecase: operation.usecase,
    }) as ReturnType<typeof spawn>

    childServerProcess.on('close', (_code) => {
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
    process.kill(-childServerProcess.pid!, 'SIGTERM')
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

    if (i !== (operations.length - 1)) {
      logAfterBenchmark(defaultSettings)

      await sleep(defaultSettings?.delayBeforeRunning || 10)
    }
    else {
      logCompleteBenchmark()
    }
  }
}

start(
  {
    defaultSettings: {
      workers: 3,
      delayBeforeRunning: 10,
      duration: 10,
      connections: 100,
      pipelining: 1,
    },
    operations: buildOperations(usecases, transports, [2]),
  },
)

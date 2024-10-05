/* eslint-disable no-async-promise-executor */
import type { spawn } from 'node:child_process'
import { startEntrypoint } from '../server/entrypoint'
import { usecaseMap } from '../server/types'
import { buildOperations, logAfterBenchmark, logBeforeBenchmark, logCompleteBenchmark, prepareToBenchmarkFileOnDisk, sleep, updateBenchmarkInfo } from './utils'
import type { TDefaultSettings, TRuntimeSettings } from './utils'
import { startBenchmark } from './benchmark'
import { automateBenchmarkConfig } from './benchmark-config'

const runScript = async (
  defaultSettings: TDefaultSettings,
  operation: TRuntimeSettings,
  pathToLastSnapshotFile: string,
): Promise<void> => {
  return new Promise(async (resolve) => {
    // 1. Run server
    const childServerProcess = await startEntrypoint({
      cores: operation.cores,
      transport: operation.transport,
      usecase: operation.usecase,
    }) as ReturnType<typeof spawn>

    childServerProcess.on('close', (_code) => {
      console.log('set null to child process 1')
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
    process.kill(childServerProcess.pid!, 'SIGTERM')
  })
}

const start = async ({ defaultSettings, operations }: { defaultSettings: TDefaultSettings, operations: TRuntimeSettings[] }) => {
  // Write info about default settings related with benchmark
  const pathToLastSnapshotFile = await prepareToBenchmarkFileOnDisk(defaultSettings)

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]!

    logBeforeBenchmark(defaultSettings, operation, i, operations.length)

    // Run main logic (server + benchmark)
    await runScript(defaultSettings, operation, pathToLastSnapshotFile)

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
    defaultSettings: automateBenchmarkConfig.defaultSettings,
    operations: buildOperations(automateBenchmarkConfig.runtimeSettings),
  },
)

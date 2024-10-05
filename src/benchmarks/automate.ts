/* eslint-disable no-async-promise-executor */
import { startEntrypoint } from '../server/entrypoint'
import { usecaseMap } from '../server/misc/types'
import { configureCascadeMasterGracefulShutdown } from '../server/misc/helpers'
import type { ServerProcessManager } from '../server/misc/server-process-manager'
import {
  buildOperations,
  logAfterBenchmark,
  logBeforeBenchmark,
  logCompleteBenchmark,
  prepareToBenchmarkFileOnDisk,
  sleep,
  updateBenchmarkInfo,
} from './utils'
import type { TDefaultSettings, TRuntimeSettings } from './utils'
import { startBenchmark } from './benchmark'
import { automateBenchmarkConfig } from './benchmark-config'

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

const start = async ({ defaultSettings, operations }: { defaultSettings: TDefaultSettings, operations: TRuntimeSettings[] }) => {
  /**
   * @description Graceful shutdown callback some way must
   * hold reference to the actual child process.
   * Since brand new process is spawn in while cycle, we must use
   * one global GS callback which tracks down last spawned process.
   */
  const currentChildProcessManagerRef: { value: ServerProcessManager | null } = { value: null }

  // Set graceful shutdown
  configureCascadeMasterGracefulShutdown(currentChildProcessManagerRef)

  // Write info about default settings related with benchmark
  const pathToLastSnapshotFile = await prepareToBenchmarkFileOnDisk(defaultSettings)

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]!

    logBeforeBenchmark(defaultSettings, operation, i, operations.length)

    // Run main logic (server + benchmark)
    await runScript(defaultSettings, operation, pathToLastSnapshotFile, currentChildProcessManagerRef)

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

import { startEntrypoint } from '../server/entrypoint'
import { usecaseMap } from '../server/misc/types'
import { configureCascadeMasterGracefulShutdown, runScript } from '../server/misc/helpers'
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

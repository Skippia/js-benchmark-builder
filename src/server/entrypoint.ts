import { checkIsManualMode, getRuntimeSettings } from '../benchmarks/utils/helpers'

import { configureCascadeMasterGracefulShutdown } from './misc/helpers'
import { ServerProcessManager } from './misc/server-process-manager'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from './misc/types'

/**
 * @returns Ready accept to requests child server process
 */
async function startEntrypoint({
  transport,
  usecase,
  cores,
}: {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number
}): Promise<ServerProcessManager> {
  // 1. Create wrapper around process instance (still empty)
  const childProcessManager = new ServerProcessManager(transport, usecase, cores)

  // 2. Spawn child process
  await childProcessManager.start()

  return childProcessManager
}

const isManualMode = checkIsManualMode()

// ! Run in manual mode (run from CLI is forbidden in automate mode)
if (isManualMode) {
  const { usecase, transport, cores } = getRuntimeSettings()

  void startEntrypoint({ usecase, transport, cores })
    .then((currentChildProcessManager) => {
    // Set graceful shutdown
      configureCascadeMasterGracefulShutdown({ value: currentChildProcessManager })
    })
}

// Export for automate mode
export { startEntrypoint }

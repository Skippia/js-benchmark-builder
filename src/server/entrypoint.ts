import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { getFlagValue, getRuntimeSettings } from '../benchmarks/utils/helpers'
import { configureCascadeMasterGracefulShutdownOnSignal, runServerInChildProcess } from './helpers'
import { type THostEnvironment, type TTransportTypeUnion, type TUsecaseTypeUnion, transports, usecases } from './types'

/**
 * @returns Ready accept to requests child server process
 */
function startEntrypoint({
  transport,
  usecase,
  cores,
}: {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number
}) {
  return new Promise((resolve) => {
    const hostEnvironment: THostEnvironment = transport === 'bun' ? 'bun' : 'node'

    const childServerProcessRef: { value: ChildProcessWithoutNullStreams | null } = { value: runServerInChildProcess(hostEnvironment, transport, usecase, cores) }

    childServerProcessRef.value?.stdout.on('data', (data) => {
      const stdoutInfo = data?.toString()

      if (!stdoutInfo.startsWith('[Hook]')) console.log(stdoutInfo)

      // ! When server starts, it should contain this phrase!
      // TODO: change to getting message from child process
      if (stdoutInfo.includes('server running on')) {
        // Server is ready to accept requests
        resolve(childServerProcessRef.value)
      }
    })

    childServerProcessRef.value?.stderr.on('data', (data) => {
      console.log(`stderr`, data?.toString())
    })

    childServerProcessRef.value?.on('close', (_code) => {
      childServerProcessRef.value = null
    })

    ;(['SIGINT', 'SIGTERM'] as const)
      .forEach(
        signal => configureCascadeMasterGracefulShutdownOnSignal(childServerProcessRef, signal),
      )
  })
}

// ! Run in manual mode (run from CLI is forbidden in automate mode)
const isAutomateMode = getFlagValue('automate')

if (!isAutomateMode) {
  const { usecase, transport, cores } = getRuntimeSettings()

  if (!usecases.includes(usecase) || !transports.includes(transport)) {
    throw new Error('Transport or usecases was set incorrect way!')
  }

  startEntrypoint({ usecase, transport, cores })
}

// Export for benchmark
export { startEntrypoint }

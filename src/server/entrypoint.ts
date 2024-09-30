import { spawn } from 'node:child_process'
import { cpus } from 'node:os'
import { getFlagValue } from '../benchmarks/utils/helpers'
import { usecases } from './usecases/usecase-map'
import { type TTransportTypeUnion, type TUsecaseTypeUnion, transports } from './transports'

/**
 * @returns Ready child server process
 */
function startEntrypoint({
  transport,
  usecase,
  cores,
}: {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number | string | 'max' | undefined
}) {
  return new Promise((resolve) => {
    const hostEnvironment = transport === 'bun' ? 'bun' : 'node'
    const realCores = cores === 'max'
      ? cpus().length
      : typeof cores === 'undefined'
        ? 1
        : Number(cores)

    const childServerProcess = spawn(hostEnvironment, [
      './dist/server/main.js',
      '-t',
      transport,
      '-u',
      usecase,
      '-cores',
      String(realCores),
    ], {
      detached: true,
    })

    childServerProcess.stdout.on('data', (data) => {
      const stdoutInfo = data?.toString()

      if (!stdoutInfo.startsWith('[Hook]')) console.log(stdoutInfo)

      if (stdoutInfo.includes('server running on')) {
        // Server is ready to accept requests
        resolve(childServerProcess)
      }
    })

    childServerProcess.stderr.on('data', (data) => {
      console.log(`stderr`, data?.toString())
    })

    process.on('SIGINT', () => {
      process.kill(childServerProcess.pid!, 'SIGINT')

      childServerProcess.on('close', () => {
        process.exit(0)
      })
    })
  })
}

// Run from CLI is forbidden in automate mode
const isAutomateMode = getFlagValue('-automate')

if (!isAutomateMode) {
  const [usecase, transport, cores] = [
    getFlagValue('u') as TUsecaseTypeUnion,
    getFlagValue('t') as TTransportTypeUnion,
    getFlagValue('cores'),
  ]

  if (!usecases.includes(usecase) || !transports.includes(transport)) {
    throw new Error('Transport or usecases was set incorrect way!')
  }

  startEntrypoint({ usecase, transport, cores })
}

// Export for benchmark
export { startEntrypoint }

import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { cpus } from 'node:os'
import process from 'node:process'

import { ALLOWED_FLAGS, TRANSPORTS, USECASES } from './constants'
import type { ServerProcessManager } from './server-process-manager'
import type { TAllowedFlags, TRuntimeSettings, TTransportTypeUnion, TUsecaseTypeUnion } from './types'

const isPositiveNumeric = (value: string | undefined | null) => (value !== null && typeof value !== 'undefined') ? /^\d+$/.test(value) : false
const isTransport = (val: unknown): val is TTransportTypeUnion => TRANSPORTS.includes(val as TTransportTypeUnion)
const isUsecase = (val: unknown): val is TUsecaseTypeUnion => USECASES.includes(val as TUsecaseTypeUnion)

/**
 * @description GS for parent process
 */
const configureCascadeMasterGracefulShutdown = (childProcessManagerRef: { value: ServerProcessManager | null }) => {
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

const convertCLICoresOptionToRealCores = (cores: number | 'max' | undefined): number =>
  cores === 'max'
    ? cpus().length
    : typeof cores === 'undefined'
      ? 1
      : Number(cores)

const getFlagValue = (flag: TAllowedFlags): TTransportTypeUnion | TUsecaseTypeUnion | 'max' | 'automate-mode' | 'manual-mode' | number | undefined => {
  const options = process.argv.slice(2)
  const index = options.indexOf(`-${flag}`)

  if (!ALLOWED_FLAGS.includes(flag) || (index === -1 && !(['automate', 'cores'].includes(flag)))) throw new Error(`Unknown flag ${flag} was detected!`)

  const foundVal = index !== -1 ? options[index + 1] : undefined

  // console.dir({ options, index, foundVal })

  if (flag === 'automate') return index !== -1 ? 'automate-mode' : 'manual-mode'
  if (flag === 'cores' && foundVal !== 'max' && !isPositiveNumeric(foundVal)) return undefined // will be set default value
  if (['c', 'd', 'w', 'p'].includes(flag) && !isPositiveNumeric(foundVal)) return undefined // will be set default values
  if (flag === 't' && !isTransport(foundVal)) throw new Error(`Invalid transport: ${foundVal}`)
  if (flag === 'u' && !isUsecase(foundVal)) throw new Error(`Invalid usecase: ${foundVal}`)

  return isPositiveNumeric(foundVal) ? Number(foundVal) : foundVal as TTransportTypeUnion | TUsecaseTypeUnion | 'max'
}

const getRuntimeSettings = (): TRuntimeSettings => ({
  transport: getFlagValue('t') as TTransportTypeUnion,
  usecase: getFlagValue('u') as TUsecaseTypeUnion,
  cores: convertCLICoresOptionToRealCores(getFlagValue('cores') as number | 'max' | undefined),
})

const checkIsManualMode = () => getFlagValue('automate') === 'manual-mode'

export {
  checkIsManualMode,
  configureCascadeMasterGracefulShutdown,
  convertCLICoresOptionToRealCores,
  getFlagValue,
  getRuntimeSettings,
}

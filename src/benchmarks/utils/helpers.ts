/* eslint-disable ts/no-shadow */
import { cpus } from 'node:os'
import process from 'node:process'

import { transports, usecases } from '../../server/misc/types'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../../server/misc/types'

import { ALLOWED_FLAGS } from './types'
import type { second, TAllowedFlags, TAutomateConfig, TDefaultSettings, TRuntimeSettings } from './types'

const isPositiveNumeric = (value: string | undefined | null) => (value !== null && typeof value !== 'undefined') ? /^\d+$/.test(value) : false
const isTransport = (val: unknown): val is TTransportTypeUnion => transports.includes(val as TTransportTypeUnion)
const isUsecase = (val: unknown): val is TUsecaseTypeUnion => usecases.includes(val as TUsecaseTypeUnion)
const checkIsManualMode = () => getFlagValue('automate') === 'manual-mode'

const sleep = (ms: second) => new Promise((resolve) => {
  setTimeout(resolve, ms * 1000)
})

const logBeforeBenchmark = (defaultSettings: TDefaultSettings, operation: TRuntimeSettings, i: number, totalAmountOperations: number) => {
  console.log('\n######################################################################################')
  console.log(`.......Run #${i + 1}/${totalAmountOperations} [${operation.usecase}] usecase on [${operation.transport}] transport during ${defaultSettings.duration}s at ${operation.cores} core(s).......`)
}
const logAfterBenchmark = (defaultSettings: TDefaultSettings) => console.log(`\n.......Benchmark has been completed. Sleep for ${defaultSettings.delayBeforeRunning}s before next test.......`)
const logCompleteBenchmark = () => console.log('`\n.......Benchmark successfully has been completed')

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

const convertCLICoresOptionToRealCores = (cores: number | 'max' | undefined): number =>
  cores === 'max'
    ? cpus().length
    : typeof cores === 'undefined'
      ? 1
      : Number(cores)

const getRuntimeSettings = (): TRuntimeSettings => ({
  transport: getFlagValue('t') as TTransportTypeUnion,
  usecase: getFlagValue('u') as TUsecaseTypeUnion,
  cores: convertCLICoresOptionToRealCores(getFlagValue('cores') as number | 'max' | undefined),
})

const buildOperations = ({
  usecases,
  transports,
  cores,
}: TAutomateConfig['runtimeSettings']) => usecases.flatMap(usecase =>
  transports.flatMap(transport =>
    cores.map(_cores => ({
      transport,
      usecase,
      cores: convertCLICoresOptionToRealCores(_cores),
    }) satisfies TRuntimeSettings),
  ),
)

export {
  buildOperations,
  checkIsManualMode,
  getFlagValue,
  getRuntimeSettings,
  isPositiveNumeric,
  logAfterBenchmark,
  logBeforeBenchmark,
  logCompleteBenchmark,
  sleep,
}

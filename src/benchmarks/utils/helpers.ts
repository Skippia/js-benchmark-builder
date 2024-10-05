import { cpus } from 'node:os'
import process from 'node:process'
import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../../server/misc/types'
import { ALLOWED_FLAGS, type TAllowedFlags, type TAutomateConfig, type TDefaultSettings, type TRuntimeSettings, type second } from './types'

const sleep = (ms: second) => new Promise(res => setTimeout(res, ms * 1000))

const logBeforeBenchmark = (defaultSettings: TDefaultSettings, operation: TRuntimeSettings, i: number, totalAmountOperations: number) => {
  console.log('\n######################################################################################')
  console.log(`.......Run #${i + 1}/${totalAmountOperations} [${operation.usecase}] usecase on [${operation.transport}] transport during ${defaultSettings.duration}s at ${operation.cores} core(s).......`)
}
const logAfterBenchmark = (defaultSettings: TDefaultSettings) => {
  console.log(`\n.......Benchmark has been completed. Sleep for ${defaultSettings.delayBeforeRunning}s before next test.......`)
}

const logCompleteBenchmark = () => {
  console.log('`\n.......Benchmark successfully has been completed')
}

const getFlagValue = (flag: TAllowedFlags): TUsecaseTypeUnion | TTransportTypeUnion | string | undefined => {
  if (!ALLOWED_FLAGS.includes(flag)) throw new Error(`Unknown flag ${flag} was detected!`)

  const options = process.argv

  const index = options.indexOf(`-${flag}`)

  if (flag === 'automate' && index !== -1) return 'automate-mode'

  return index !== -1 ? options[index + 1] : undefined
}

export const convertCLICoresOptionToRealCores = (cores: number | string | 'max' | undefined): number =>
  cores === 'max'
    ? cpus().length
    : typeof cores === 'undefined'
      ? 1
      : Number(cores)

export const getRuntimeSettings = (): TRuntimeSettings => ({
  transport: getFlagValue('t') as TTransportTypeUnion,
  usecase: getFlagValue('u') as TUsecaseTypeUnion,
  cores: convertCLICoresOptionToRealCores(getFlagValue('cores')),
})

const buildOperations = ({
  usecases,
  transports,
  cores,
}: TAutomateConfig['runtimeSettings']) => {
  return usecases.flatMap(usecase =>
    transports.flatMap(transport =>
      cores.map(_cores => ({
        transport,
        usecase,
        cores: convertCLICoresOptionToRealCores(_cores),
      }) satisfies TRuntimeSettings),
    ),
  )
}

const checkIsManualMode = () => !getFlagValue('automate')

export {
  sleep,
  getFlagValue,
  logBeforeBenchmark,
  logAfterBenchmark,
  logCompleteBenchmark,
  buildOperations,
  checkIsManualMode,
}

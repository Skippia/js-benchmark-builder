import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../../server/transports'
import type { TDefaultSettings, TRuntimeSettings, second } from './types'

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

const getFlagValue = (flag: 'u' | 't' | '-automate' | 'cores'): TUsecaseTypeUnion | TTransportTypeUnion | string | undefined => {
  if (!['u', 't', '-automate', 'cores'].includes(flag)) {
    throw new Error(`Unknown flag ${flag} was detected!`)
  }

  const options = process.argv

  const index = options.indexOf(`-${flag}`)

  if (index !== -1 && flag === '-automate') return 'automate-mode'

  if (index === -1 && flag !== 'cores') {
    throw new Error(`Value for flag ${flag} was not found!`)
  }

  return index !== -1 ? options[index + 1] : undefined
}

const buildOperations = (
  usecases: TUsecaseTypeUnion[],
  transports: TTransportTypeUnion[],
  cores: (number | 'max')[],
) => {
  return usecases.flatMap(usecase =>
    transports.flatMap(transport =>
      cores.map(coreCount => ({
        transport,
        usecase,
        cores: coreCount,
      }) satisfies TRuntimeSettings),
    ),
  )
}

export { sleep, getFlagValue, logBeforeBenchmark, logAfterBenchmark, logCompleteBenchmark, buildOperations }

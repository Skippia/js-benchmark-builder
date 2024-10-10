import { convertCLICoresOptionToRealCores } from '@shared/helpers'
import type { second, TDefaultSettings, TRuntimeSettings } from '@shared/types'

import type { TAutomateConfig } from './types'

const sleep = (ms: second) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms * 1000)
})

const logBeforeBenchmark = (defaultSettings: TDefaultSettings, operation: TRuntimeSettings, i: number, totalAmountOperations: number) => {
  console.log('\n######################################################################################')
  console.log(`.......Run #${i + 1}/${totalAmountOperations} [${operation.usecase}] usecase on [${operation.transport}] transport during ${defaultSettings.duration}s at ${operation.cores} core(s).......`)
}
const logAfterBenchmark = (defaultSettings: TDefaultSettings) => console.log(`\n.......Benchmark has been completed. Sleep for ${defaultSettings.delayBeforeRunning}s before next test.......`)
const logCompleteBenchmark = () => console.log('`\n.......Benchmark successfully has been completed')

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
  logAfterBenchmark,
  logBeforeBenchmark,
  logCompleteBenchmark,
  sleep,
}

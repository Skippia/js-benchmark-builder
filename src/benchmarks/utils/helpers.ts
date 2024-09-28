import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../../server/transports'
import type { TDefaultSettings, TRuntimeSettings, second } from './types'

const sleep = (ms: second) => new Promise(res => setTimeout(res, ms * 1000))

const logBeforeBenchmark = (defaultSettings: TDefaultSettings, operation: TRuntimeSettings, i: number, totalAmountOperations: number) => {
  console.log('\n######################################################################################')
  console.log(`.......Run #${i + 1}/${totalAmountOperations} [${operation.usecase}] usecase on [${operation.transport}] transport during ${defaultSettings.duration}s at ${defaultSettings.core} core(s).......`)
}
const logAfterBenchmark = (defaultSettings: TDefaultSettings) => {
  console.log(`\n.......Benchmark has been completed. Sleep for ${defaultSettings.delayBeforeRunning}s before next test.......`)
}

const buildOperations = (usecases: TUsecaseTypeUnion[], transports: TTransportTypeUnion[]) =>
  usecases.flatMap(usecase =>
    transports.map(transport => ({
      transport,
      usecase,
    } as TRuntimeSettings)),
  )

export { sleep, logBeforeBenchmark, logAfterBenchmark, buildOperations }

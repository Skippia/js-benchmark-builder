import type { second, TDefaultSettings, TRuntimeSettings } from '../../server/utils/types'

const sleep = (ms: second) => new Promise<void>((resolve) => {
  setTimeout(resolve, ms * 1000)
})

const logBeforeBenchmark = (defaultSettings: TDefaultSettings, operation: TRuntimeSettings, i: number, totalAmountOperations: number) => {
  console.log('\n######################################################################################')
  console.log(`.......Run #${i + 1}/${totalAmountOperations} [${operation.usecase}] usecase on [${operation.transport}] transport during ${defaultSettings.duration}s at ${operation.cores} core(s).......`)
}
const logAfterBenchmark = (defaultSettings: TDefaultSettings) => console.log(`\n.......Benchmark has been completed. Sleep for ${defaultSettings.delayBeforeRunning}s before next test.......`)
const logCompleteBenchmark = () => console.log('`\n.......Benchmark successfully has been completed')

export {
  logAfterBenchmark,
  logBeforeBenchmark,
  logCompleteBenchmark,
  sleep,
}

import { transports, usecases } from '../server/misc/types'
import type { TAutomateConfig } from './utils'

export const defaultBenchmarkConfig: TAutomateConfig['defaultSettings'] = {
  workers: 3,
  delayBeforeRunning: 5,
  duration: 5,
  connections: 100,
  pipelining: 1,
}

export const automateBenchmarkConfig: TAutomateConfig = {
  defaultSettings: defaultBenchmarkConfig,
  runtimeSettings: { usecases: usecases.slice(0, 1), transports, cores: [1] },
}

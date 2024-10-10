import { TRANSPORTS, USECASES } from '@shared/constants'

import type { TAutomateConfig } from './utils/types'

export const defaultBenchmarkConfig: TAutomateConfig['defaultSettings'] = {
  workers: 3,
  delayBeforeRunning: 2,
  duration: 5,
  connections: 100,
  pipelining: 1,
}

export const automateBenchmarkConfig: TAutomateConfig = {
  defaultSettings: defaultBenchmarkConfig,
  runtimeSettings: { usecases: USECASES.slice(0, 1), transports: TRANSPORTS, cores: [1] },
}

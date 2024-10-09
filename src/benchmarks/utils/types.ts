import type { TDefaultSettings, TTransportTypeUnion, TUsecaseConfig, TUsecaseTypeUnion } from '../../server/utils/types'

type TBenchmarkSettingsCLI = Omit<TDefaultSettings, 'cores' | 'delayBeforeRunning'>
  & { usecaseConfig: TUsecaseConfig } & Partial<Pick<TResultBenchmark, 'transport' | 'usecase'>>

type TBenchmarkSettingsProgrammatically = TBenchmarkSettingsCLI
  & Pick<TResultBenchmark, 'transport' | 'usecase'>

type TResultBenchmark = {
  transport?: TTransportTypeUnion
  usecase?: TUsecaseTypeUnion
  critical_errors: unknown
  errors: number
  timeouts: number
  latency: {
    average: number
    min: number
    max: number
    p75: number
    p90: number
    p99: number
  }
  requests: {
    totalAmount: number
    average: number
    min: number
    max: number
    p75: number
    p90: number
    p99: number
  }
}

type TSnapshotOnDisk = {
  benchmarkConfig: TDefaultSettings
  benchmarks: TResultBenchmark[]
}

type TFileInput = { pathToStorage: string, fileContent: Partial<TSnapshotOnDisk> }

export type {
  TBenchmarkSettingsCLI,
  TBenchmarkSettingsProgrammatically,
  TFileInput,
  TResultBenchmark,
  TSnapshotOnDisk,
  TUsecaseConfig,
}

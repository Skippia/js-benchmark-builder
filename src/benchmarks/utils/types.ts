import type { TTransportTypeUnion, TUsecaseTypeUnion } from '../../server/transports'

type second = number

type TDefaultSettings = {
  core: number
  delayBeforeRunning?: second
  connections: number
  pipelining: number
  workers: number
  duration: second
}

type TUsecaseConfig = { method: 'GET' | 'POST', path: string }

type TBenchmarkSettingsCLI = Omit<TDefaultSettings, 'core' | 'delayBeforeRunning'>
  & { usecaseConfig: TUsecaseConfig } & Partial<Pick<TResultBenchmark, 'transport' | 'usecase'>>

type TBenchmarkSettingsProgrammatically = TBenchmarkSettingsCLI & Pick<TResultBenchmark, 'transport' | 'usecase'>

type TResultBenchmark = {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
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

type TRuntimeSettings = {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
}

type TSnapshotOnDisk = {
  benchmarkConfig: TDefaultSettings
  benchmarks: TResultBenchmark[]
}

type TFileInput = { pathToStorage: string, fileContent: Partial<TSnapshotOnDisk> }

export type {
  second,
  TRuntimeSettings,
  TFileInput,
  TDefaultSettings,
  TUsecaseConfig,
  TBenchmarkSettingsCLI,
  TBenchmarkSettingsProgrammatically,
  TResultBenchmark,
  TSnapshotOnDisk,
}

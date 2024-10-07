import type { TTransportTypeUnion, TUsecaseConfig, TUsecaseTypeUnion } from '../../server/misc/types'

type second = number

type TDefaultSettings = {
  delayBeforeRunning?: second
  connections: number
  pipelining: number
  workers: number
  duration: second
}

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

/**
 * @description Config which we can get parsing CLI flags
 */
type TRuntimeSettings = {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number
}

type TSnapshotOnDisk = {
  benchmarkConfig: TDefaultSettings
  benchmarks: TResultBenchmark[]
}

type TFileInput = { pathToStorage: string, fileContent: Partial<TSnapshotOnDisk> }

const ALLOWED_FLAGS = ['u', 't', 'c', 'p', 'w', 'd', 'automate', 'cores'] as const

type TAllowedFlags = typeof ALLOWED_FLAGS[number]

type TAutomateConfig = {
  defaultSettings: Required<TDefaultSettings>
  runtimeSettings: {
    usecases: readonly TUsecaseTypeUnion[]
    transports: readonly TTransportTypeUnion[]
    cores: ('max' | number)[]
  }
}

export type {
  second,
  TAllowedFlags,
  TAutomateConfig,
  TBenchmarkSettingsCLI,
  TBenchmarkSettingsProgrammatically,
  TDefaultSettings,
  TFileInput,
  TResultBenchmark,
  TRuntimeSettings,
  TSnapshotOnDisk,
  TUsecaseConfig,
}

export { ALLOWED_FLAGS }

import type { TAllowedFlags, TTransportTypeUnion, TUsecaseConfig, TUsecaseTypeUnion } from './constants'

type second = number

/**
 * @description Config which we can get parsing CLI flags
 */
type TRuntimeSettings = {
  transport: TTransportTypeUnion
  usecase: TUsecaseTypeUnion
  cores: number
}

type TDefaultSettings = {
  delayBeforeRunning: second
  connections: number
  pipelining: number
  workers: number
  duration: second
}

type THostEnvironment = 'bun' | 'node'

export type {
  second,
  TAllowedFlags,
  TDefaultSettings,
  THostEnvironment,
  TRuntimeSettings,
  TTransportTypeUnion,
  TUsecaseConfig,
  TUsecaseTypeUnion,
}

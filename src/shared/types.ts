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

type THostEnvironment = 'bun' | 'node'

type TInvert<T extends Record<string, string>> = {
  [key in T[keyof T]]: {
    [keyInner in keyof T]: T[keyInner] extends key ? keyInner : never
  }[keyof T]
}

export type {
  second,
  TAllowedFlags,
  THostEnvironment,
  TInvert,
  TRuntimeSettings,
  TTransportTypeUnion,
  TUsecaseConfig,
  TUsecaseTypeUnion,
}

import type { TUsecaseTypeUnion } from '../transports'

type TMap<T extends TUsecaseTypeUnion> = Partial<Record<T, { method: 'GET' | 'POST', path: `/${T}` }>>

export declare const usecaseMap: TMap<TUsecaseTypeUnion>

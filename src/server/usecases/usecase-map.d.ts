import type { TUsecaseConfig } from '../../benchmarks/utils'
import type { TUsecaseTypeUnion } from '../transports'

type TMap<T extends TUsecaseTypeUnion> = Partial<Record<T, TUsecaseConfig<T>>>

export declare const usecaseMap: TMap<TUsecaseTypeUnion>
export declare const usecases: TUsecaseTypeUnion[]

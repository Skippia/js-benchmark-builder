import type { TUsecaseType } from '../transports'

export const usecaseMap: Partial<Record<TUsecaseType, { method: 'GET' | 'POST', path: string }>> = {
  empty: {
    method: 'GET',
    path: '/empty',
  },
}

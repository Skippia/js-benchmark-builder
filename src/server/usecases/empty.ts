import type { TContext, TFunction, THooks } from '../utils/types'

export const hooks: THooks = {
  onInit(callbacks?: TFunction[]): TContext {
    const context = {}
    console.log('[Hook][onInit]: Initializing context...')

    callbacks?.forEach(c => c())

    return context
  },
  // async onRequest(_req: Request): Promise<void> {
  //   console.log('[Hook][onRequest]: Request received...')
  // },

  // async onFinish(_res: Response): Promise<void> {
  //   console.log('[Hook][onFinish]: Finishing response...')
  // },

  onClose(): void {
    console.log('[Hook][onClose]: Close server...')
  },
}

export function run(
  _payload: unknown,
  _context: TContext,
): unknown {
  return 'Empty data'
}

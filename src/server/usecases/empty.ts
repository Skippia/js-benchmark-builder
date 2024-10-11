import type { TContext, THooks } from '../utils/types'

export const hooks: THooks = {
  onInit(): TContext {
    const context = {}
    console.log('[Hook][onInit]: Initializing context...')

    return context
  },
  // onRequest(_req: Request): void {
  //   console.log('[Hook][onRequest]: Request received...')
  // },

  // onFinish(_res: Response): void {
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

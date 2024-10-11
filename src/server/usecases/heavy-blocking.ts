import type { TContext, THooks } from '../utils/types'

function heavyBlockingTask() {
  let sum = 0

  for (let i = 0; i < 1e8; i++) {
    sum += i
  }

  return sum
}

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
  return heavyBlockingTask()
}

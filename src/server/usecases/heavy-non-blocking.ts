import type { TContext, THooks } from '../utils/types'

function heavyNonBlockingTask(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
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

export async function run(
  _payload: unknown,
  _context: TContext,
): Promise<unknown> {
  return await heavyNonBlockingTask()
}

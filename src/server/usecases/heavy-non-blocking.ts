import type { TContext, TFunction, THooks } from '../misc/types'

function heavyNonBlockingTask(ms = 100) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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

export async function run(
  _payload: unknown,
  _context: TContext,
): Promise<unknown> {
  return await heavyNonBlockingTask()
}

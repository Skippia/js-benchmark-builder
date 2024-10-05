import type { TContext, THooks, TRunFn } from '../misc/types'

export const hooks: THooks = {
  async onInit(callbacks?: Function[]): Promise<TContext> {
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

  async onClose(): Promise<void> {
    console.log('[Hook][onClose]: Close server...')
  },
}

export async function run(
  _payload: unknown,
  _context: TContext,
): Promise<unknown> {
  return 'Empty data'
}

// export const usecase: TUsecaseBuilder = {
//   hooks: {
//     async onInit(callbacks?: Function[]): Promise<TContext> {
//       const context = {}
//       console.log('[Hook][onInit]: Initializing context...')

//       callbacks?.forEach(c => c())

//       return context
//     },
//     // async onRequest(_req: Request): Promise<void> {
//     //   console.log('[Hook][onRequest]: Request received...')
//     // },

//     // async onFinish(_res: Response): Promise<void> {
//     //   console.log('[Hook][onFinish]: Finishing response...')
//     // },
//     async onClose(): Promise<void> {
//       console.log('[Hook][onClose]: Close server...')
//     },
//   },
//   async run(_payload?: unknown, _context?: TContext): Promise<unknown> {
//     return 'Empty data'
//   },
// }

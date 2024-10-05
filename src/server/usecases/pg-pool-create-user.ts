import { createUser, pgPoolClient } from '../infra/pg.mjs'
import type { TContext, THooks } from '../misc/types'

type PgPoolCreateUserContext
  = TContext & { createUser: ({ email, password }: { email: string, password: string }) => Promise<string> }

export const hooks: THooks = {
  async onInit(callbacks?: Function[]): Promise<PgPoolCreateUserContext> {
    const context: PgPoolCreateUserContext = {
      createUser: createUser(pgPoolClient),
    }
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
  payload: { email: string, password: string },
  context: PgPoolCreateUserContext,
): Promise<unknown> {
  const { email, password } = payload

  const userId = await context.createUser({ email, password })

  return userId
}

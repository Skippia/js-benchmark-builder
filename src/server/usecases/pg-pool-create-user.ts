import { createUser, pgPoolClient } from '../infra/pg.mjs'
import type { TContext, THooks } from '../utils/types'

type PgPoolCreateUserContext
  = TContext & { createUser: ({ email, password }: { email: string, password: string }) => Promise<string> }

export const hooks: THooks = {
  onInit(): PgPoolCreateUserContext {
    const context: PgPoolCreateUserContext = {
      createUser: createUser(pgPoolClient),
    }
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
  payload: { email: string, password: string },
  context: PgPoolCreateUserContext,
): Promise<unknown> {
  const { email, password } = payload

  const userId = await context.createUser({ email, password })

  return userId
}

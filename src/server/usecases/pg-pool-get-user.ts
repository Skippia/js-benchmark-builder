import { createUser, getUser, pgPoolClient } from '../infra/pg.mjs'
import type { Context, Hooks } from '../types'

type PgPoolGetUserContext
  = Context & { getUser: () => Promise<({ email: string, password: string })> }

export const hooks: Hooks = {
  async onInit(callbacks?: Function[]): Promise<PgPoolGetUserContext> {
    const context: PgPoolGetUserContext = {
      getUser: getUser(pgPoolClient),
    }

    if (!(await context.getUser())) {
      console.log('DB is empty — create new user:', { email: 'randomuser@gmail.com', password: 'hello123' })
      await createUser(pgPoolClient)({ email: 'randomuser@gmail.com', password: 'hello123' })
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
  _payload: { email: string, password: string },
  context: PgPoolGetUserContext,
): Promise<unknown> {
  const user = await context.getUser()

  return user
}

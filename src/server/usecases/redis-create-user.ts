import { createNewUser, redis } from '../infra/redis.mjs'
import type { Context, Hooks } from '../types'

type RedisCreateUserContext
  = Context & { createNewUser: ({ email, password }: { email: string, password: string }) => Promise<{ email: string, password: string }> }

export const hooks: Hooks = {
  async onInit(callbacks?: Function[]): Promise<RedisCreateUserContext> {
    const context: RedisCreateUserContext = {
      createNewUser: createNewUser(redis),
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
  context: RedisCreateUserContext,
): Promise<unknown> {
  const { email, password } = payload

  const newUser = await context.createNewUser({ email, password })

  return newUser
}

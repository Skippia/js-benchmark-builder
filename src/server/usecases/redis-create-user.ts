import { createNewUser, redis } from '../infra/redis.mjs'
import type { TContext, TFunction, THooks } from '../utils/types'

type RedisCreateUserContext
  = TContext & { createNewUser: ({ email, password }: { email: string, password: string }) => Promise<{ email: string, password: string }> }

export const hooks: THooks = {
  onInit(callbacks?: TFunction[]): RedisCreateUserContext {
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

  onClose(): void {
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

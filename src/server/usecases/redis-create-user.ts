import { createNewUser, redis } from '../infra/redis.mjs'
import type { TContext, THooks } from '../utils/types'

type RedisCreateUserContext
  = TContext &
  { createNewUser: ({ email, password }: { email: string, password: string }) =>
  Promise<{ email: string, password: string }> }

export const hooks: THooks = {
  onInit(): RedisCreateUserContext {
    const context: RedisCreateUserContext = {
      createNewUser: createNewUser(redis),
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
  context: RedisCreateUserContext,
): Promise<unknown> {
  const { email, password } = payload

  const newUser = await context.createNewUser({ email, password })

  return newUser
}

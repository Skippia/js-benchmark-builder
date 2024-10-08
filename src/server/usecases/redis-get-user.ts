import { createUser, getUser, redis } from '../infra/redis.mjs'
import type { TContext, TFunction, THooks } from '../utils/types'

type RedisGetUserContext
  = TContext & { getUser: () => Promise<({ email: string, password: string } | null)> }

export const hooks: THooks = {
  async onInit(callbacks?: TFunction[]): Promise<RedisGetUserContext> {
    const context: RedisGetUserContext = {
      getUser: () => getUser(redis),
    }

    if (!(await context.getUser())) {
      console.log('DB is empty — create new user:', { email: 'randomuser@gmail.com', password: 'hello123' })
      await createUser(redis)({ email: 'randomuser@gmail.com', password: 'hello123' })
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
  _payload: { email: string, password: string },
  context: RedisGetUserContext,
): Promise<unknown> {
  const user = await context.getUser()

  return user
}

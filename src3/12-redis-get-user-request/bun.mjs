import { serve } from 'bun'
import { createUser, getUser, redisClient } from '../infra/redis.mjs'

const port = process.env.PORT

if (!(await getUser(redisClient))) {
  await createUser(redisClient)({ email: 'randomuser@gmail.com', password: 'hello123' })
}

serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/user' && req.method === 'GET') {
      const user = await getUser(redisClient)

      return new Response(JSON.stringify(user), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  },
})

console.log(`Bun server running on http://localhost:${port}`)

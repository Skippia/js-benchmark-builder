import { serve } from 'bun'
import { createUser, pgPoolClient } from '../infra/pg.mjs'

const PORT = process.env.PORT

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === 'POST' && url.pathname === '/user') {
      try {
        const { email, password } = await req.json()
        const userId = await createUser(pgPoolClient)(email, password)

        return new Response(JSON.stringify({ message: 'User created', userId }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: error instanceof SyntaxError ? 400 : 500,
          headers: {
            'Content-Type': 'application/json',
            'Connection': 'close',
          },
        })
      }
    }
  },
})

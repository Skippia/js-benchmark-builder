// Bun Request Handler
import { serve } from "bun"
import { heavyBlockingTask } from '../shared/index.mjs'

const PORT = process.env.PORT

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/empty-request' && req.method === 'GET') {
      const result = heavyBlockingTask()
      
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
  },
})

console.log(`Bun server running on http://localhost:${PORT}`)

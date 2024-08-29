// Bun Request Handler
import { serve } from 'bun'
import { heavyNonBlockingTask } from '../shared/index.mjs'

export function run(port) {
  serve({
    port,
    fetch(req) {
      const url = new URL(req.url)
      if (url.pathname === '/heavy-non-blocking' && req.method === 'GET') {
        return new Response(JSON.stringify(heavyNonBlockingTask()), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    },
  })

  console.log(`Bun server running on http://localhost:${port}`)
}

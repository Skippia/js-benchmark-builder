// Bun Request Handler
import { serve } from "bun"


const PORT = process.env.PORT

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/json-parse-request' && req.method === 'GET') {
      const data = JSON.parse("{ hello: 'world', music: 'listen', door: 'close', number: 42, success: true, timestamp: new Date().toISOString() }")

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
  },
})

console.log(`Bun server running on http://localhost:${PORT}`)

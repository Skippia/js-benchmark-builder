// Bun Request Handler
import { serve } from "bun"


const PORT = process.env.PORT

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/empty-request' && req.method === 'GET') {
      return new Response("", { status: 200 })
    }
  },
})

console.log(`Bun server running on http://localhost:${PORT}`)

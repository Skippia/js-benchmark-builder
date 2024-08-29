import { serve } from 'bun'

export function run(port) {
  serve({
    port,
    fetch(req) {
      const url = new URL(req.url)
      if (url.pathname === '/json-parse-request' && req.method === 'GET') {
        const data = JSON.parse('{"hello":"world","music":true,"number":42,"date":"2024-09-06T20:41:07.905Z"}')

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
    },
  })

  console.log(`Bun server running on http://localhost:${port}`)
}

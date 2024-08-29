// Node.js Request Handler
import http from 'node:http'
import { heavyBlockingTask } from '../shared/index.mjs'

export function run(port) {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/heavy-blocking') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(heavyBlockingTask()))
    }
  })

  server.listen(port, () => {
    console.log(`Node.js server running on http://localhost:${port}`)
  })
}

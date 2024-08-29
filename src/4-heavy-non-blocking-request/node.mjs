// Node.js Request Handler
const http = require('http')
import { heavyNonBlockingTask } from '../shared/index.mjs'

const PORT = process.env.PORT

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/empty-request') {
    const result = heavyNonBlockingTask()

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
  }
})

server.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`)
})

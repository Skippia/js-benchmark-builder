// Node.js Request Handler
const http = require('http')

const PORT = process.env.PORT

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/json-parse-request') {
    const data = JSON.parse("{ hello: 'world', music: 'listen', door: 'close', number: 42, success: true, timestamp: new Date().toISOString() }")

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }
})

server.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`)
})

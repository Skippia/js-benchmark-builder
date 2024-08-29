import http from 'node:http'

const PORT = process.env.PORT

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/empty-request') {
    res.end('Empty request')
  }
})

server.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`)
})

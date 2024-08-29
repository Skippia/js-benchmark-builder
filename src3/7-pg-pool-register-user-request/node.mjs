import { Buffer } from 'node:buffer'
import http from 'node:http'
import { createUser, pgPoolClient } from '../infra/pg.mjs'

const PORT = process.env.PORT

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString()
      resolve(JSON.parse(body))
    })
    req.on('error', err => reject(err))
  })
}

function sendResponse(res, statusCode, headers, body) {
  headers['Content-Length'] = Buffer.byteLength(body).toString()
  res.writeHead(statusCode, headers)
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (req.method === 'POST' && req.url === '/user') {
    try {
      console.log('a')
      const body = await getRequestBody(req)
      const { email, password } = body
      const userId = await createUser(pgPoolClient)(email, password)

      const responseBody = JSON.stringify({ message: 'User created', userId })
      sendResponse(res, 201, headers, responseBody)
    }
    catch (error) {
      headers.Connection = 'close'
      const responseBody = JSON.stringify({ error: error.message })
      console.error(error)
      const statusCode = error instanceof SyntaxError ? 400 : 500
      sendResponse(res, statusCode, headers, responseBody)
    }
  }
})

server.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})

import http from "node:http"
import { initPool, createUser } from "./shared.mjs"

const pool = initPool()
const PORT = process.env.PORT

const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const body = Buffer.concat(chunks).toString()
      resolve(body)
    })
    req.on("error", (err) => reject(err))
  })
}

const sendResponse = (res, statusCode, headers, body) => {
  headers["Content-Length"] = Buffer.byteLength(body).toString()
  res.writeHead(statusCode, headers)
  res.end(body)
}

const server = http.createServer(async (req, res) => {
  const headers = {
    "Content-Type": "application/json",
  }

  if (req.method === "POST" && req.url === "/user") {
    try {
      const body = await getRequestBody(req)
      const { email, password } = JSON.parse(body)
      const userId = await createUser(pool)(email, password)

      const responseBody = JSON.stringify({ message: "User created", userId })
      sendResponse(res, 201, headers, responseBody)
    } catch (error) {
      headers["Connection"] = "close"
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

import express from 'express'

const PORT = process.env.PORT

const app = express()

app.get('/json-parse-request', (req, res) => {
  const data = JSON.parse("{ hello: 'world', music: 'listen', door: 'close', number: 42, success: true, timestamp: new Date().toISOString() }")

  res.json(data)
})

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})

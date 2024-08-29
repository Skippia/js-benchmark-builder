import express from 'express'

const PORT = process.env.PORT

const app = express()

app.get('/empty-request', (req, res) => {
  res.send('')
})

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})

import express from 'express'
import { heavyNonBlockingTask } from '../shared/index.mjs'

const PORT = process.env.PORT

const app = express()

app.get('/empty-request', (req, res) => {
  const result = heavyNonBlockingTask()
  
  res.json(result)
})

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})

import express from 'express'
import { heavyBlockingTask } from '../shared/index.mjs'

const PORT = process.env.PORT
export function run(port) {
  const app = express()

  app.get('/heavy-blocking', (req, res) => {
    res.json(heavyBlockingTask())
  })

  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`)
  })
}

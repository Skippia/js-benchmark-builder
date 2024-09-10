import express from 'express'
import { heavyNonBlockingTask } from '../shared/index.mjs'

export function run(port) {
  const app = express()

  app.get('/heavy-non-blocking', async (req, res) => {
    res.json(await heavyNonBlockingTask())
  })

  app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`)
  })
}

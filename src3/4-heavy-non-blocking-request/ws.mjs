import { App } from 'uWebSockets.js'
import { heavyNonBlockingTask } from '../shared/index.mjs'

export function run(port) {
  const app = App()

  app.get('/heavy-non-blocking', async (res, _req) => {
    res.onAborted(() => {
      res.aborted = true
    })

    const result = await heavyNonBlockingTask()

    if (!res.aborted) {
      res.cork(() => {
        res.writeHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      })
    }
  }).listen(port, (token) => {
    if (token) {
      console.log(`Secret server running on http://localhost:${port}`)
    }
    else {
      console.log(`Failed to listen to port ${port}`)
    }
  })
}

run(3001)

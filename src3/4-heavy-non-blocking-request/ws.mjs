import { App } from 'uWebSockets.js'
import { heavyNonBlockingTask } from '../shared/index.mjs'

export function run(port) {
  const app = App()

  app.get('/heavy-non-blocking', (res, _req) => {
    res.cork(() => {
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(heavyNonBlockingTask()))
    })
  }).listen(port, (token) => {
    if (token) {
      console.log(`Secret server running on http://localhost:${port}`)
    }
    else {
      console.log(`Failed to listen to port ${port}`)
    }
  })
}

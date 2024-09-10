import { App } from 'uWebSockets.js'
import { createUser, getUser, pgPoolClient } from '../infra/pg.mjs'

const port = +process.env.PORT
const app = App()

if (!(await getUser(pgPoolClient))) {
  await createUser(pgPoolClient)({ email: 'randomuser@gmail.com', password: 'hello123' })
}

app.get('/pg-pool-get-user', async (res) => {
  res.onAborted(() => {
    res.aborted = true
  })

  const user = await getUser(pgPoolClient)()

  if (!res.aborted) {
    res.cork(() => {
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(user))
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

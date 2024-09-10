import { Buffer } from 'node:buffer'
import { App } from 'uWebSockets.js'
import { createUser, pgPoolClient } from '../infra/pg.mjs'

const PORT = +process.env.PORT
const app = App()

app
  .post('/pg-pool-create-user', (res) => {
    readJson(
      res,
      (body) => {
        createUser(pgPoolClient)({ email: body.email, password: body.password }).then((userId) => {
          res.cork(() => {
            res.writeHeader('content-type', 'application/json').end(
              JSON.stringify({ message: 'User created', userId }),
            )
          })
        }).catch((err) => {
          console.error(err)
          res.cork(() => {
            res.writeStatus('500 Internal Server Error').end(JSON.stringify({ error: err.message }))
          })
        })
      },
      () => {
        console.log('Invalid JSON or no data at all!')
      },
    )
  })
  .listen(PORT, (token) => {
    if (token) {
      console.log(`Secret server running on port ${PORT}`)
    }
    else {
      console.error(`Failed to listen on port ${PORT}`)
    }
  })

/* Helper function for reading a posted JSON body */
function readJson(res, cb, err) {
  let buffer
  /* Register data cb */
  res.onData((ab, isLast) => {
    const chunk = Buffer.from(ab)
    if (isLast) {
      let json
      if (buffer) {
        try {
          json = JSON.parse(Buffer.concat([buffer, chunk]))
        }
        catch {
          /* res.close calls onAborted */
          res.close()
          return
        }
        cb(json)
      }
      else {
        try {
          json = JSON.parse(chunk)
        }
        catch {
          /* res.close calls onAborted */
          res.close()
          return
        }
        cb(json)
      }
    }
    else {
      if (buffer) {
        buffer = Buffer.concat([buffer, chunk])
      }
      else {
        buffer = Buffer.concat([chunk])
      }
    }
  })

  /* Register error cb */
  res.onAborted(err)
}

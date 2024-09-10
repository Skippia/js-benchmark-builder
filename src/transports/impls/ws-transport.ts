import { Buffer } from 'node:buffer'
import { App, type HttpRequest, type HttpResponse, type TemplatedApp } from 'uWebSockets.js'
import { AbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export type WsContextProperties = {
  server: TemplatedApp
}

export class WsTransport<T extends WsContextProperties> extends AbstractTransport<T> {
  private port: number

  constructor(port: number, mediator: Mediator<T>) {
    super(mediator)
    this.port = port
  }

  async run(): Promise<void> {
    const app = App()

    this.mediator.context = await this.initBeforeServer()

    // @ts-expect-error impossible to describe types
    app[this.mediator.targetMethod.toLowerCase()](this.mediator.targetPath, async (res: HttpResponse, _req: HttpRequest) => {
      let aborted = false

      res.onAborted(() => {
        aborted = true // Track if the request has been aborted
      })

      const handleRequest = async (body: unknown | false,
      ) => {
        this.mediator.handleRequest(body).then((result) => {
          if (!aborted) {
            res.cork(() => {
              res.writeHeader('content-type', 'application/json').end(
                JSON.stringify(result),
              )
            })
          }
        }).catch((err) => {
          console.error(err)

          if (!aborted) {
            res.cork(() => {
              res.writeStatus('500 Internal Server Error').end(JSON.stringify({ error: err.message }))
            })
          }
        })
      }

      const methodHandlers: { [key: string]: () => void } = {
        POST: () => {
          this.readJson(res, handleRequest, () => console.log('Invalid JSON or no data at all!'))
        },
        default: () => {
          handleRequest(false)
        },
      }

      return ((methodHandlers[this.mediator.targetMethod] || methodHandlers.default) as Function)()
    })

    this.mediator.context.server = app.listen(this.port, (token) => {
      if (token) {
        console.log(`Ws server running on http://localhost:${this.port}`)
      }
      else {
        console.error(`Failed to listen on port ${this.port}`)
      }
    })

    this.gracefulShutdown({
      closeServerCallback: () => { this.mediator.context.server.close() },
    })
  }

  /* Helper function for reading a posted JSON body */
  async readJson(res: HttpResponse, cb: (body: unknown) => void, err: () => void) {
    let aborted = false
    let buffer: Buffer

    /* Register onAborted callback */
    res.onAborted(() => {
      aborted = true // Mark as aborted
      err() // Call the error handler
    })

    /* Register data cb */
    res.onData((ab, isLast) => {
      if (aborted)
        return

      const chunk = Buffer.from(ab)
      if (isLast) {
        let json: unknown
        if (buffer) {
          try {
            // @ts-expect-error ...
            json = JSON.parse(Buffer.concat([buffer, chunk]))
          }
          catch {
            /* res.close calls onAborted */
            if (!aborted) {
              res.close() // If JSON parsing fails, close the response
            }
            return
          }
          cb(json)
        }
        else {
          try {
            // @ts-expect-error ...
            json = JSON.parse(chunk)
          }
          catch {
            if (!aborted) {
              res.close() // If JSON parsing fails, close the response
            }
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
  }
}

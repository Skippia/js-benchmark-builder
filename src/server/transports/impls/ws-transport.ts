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

    // const handleRequest = this.mediator.buildHandleRequestWrapper(this.readJson)

    // @ts-expect-error impossible to describe types
    app[this.mediator.targetMethod.toLowerCase()](this.mediator.targetPath, async (res: HttpResponse, _req: HttpRequest) => {
      let aborted = false

      res.onAborted(() => {
        aborted = true
      })

      try {
        // const result = await handleRequest(res)
        const result = await this.mediator._handleRequest()

        if (!aborted) {
          res.cork(() => {
            res.writeHeader('content-type', 'application/json').end(
              JSON.stringify(result),
            )
          })
        }
      }
      catch (err) {
        console.error(err)

        if (!aborted) {
          res.cork(() => {
            res.writeStatus('500 Internal Server Error').end(JSON.stringify(err))
          })
        }
      }
    })

    this.mediator.context.server = app.listen(this.port, (token) => {
      if (token) {
        console.log(`Ws server running on http://localhost:${this.port}`)
      }
      else {
        console.error(`Failed to listen on port ${this.port}`)
      }
    })

    this.gracefulShutdown(() => {
      this.mediator.context.server.close()
    },
    )
  }

  async readJson(res: HttpResponse): Promise<unknown> {
    let aborted = false
    let buffer: Buffer

    return new Promise((resolve, reject) => {
      /* Register onAborted callback */
      res.onAborted(() => {
        aborted = true
        return reject(new Error('Aborted'))
      })

      res.onData((arrayBuffer, isLastChunk) => {
        const chunk = Buffer.from(arrayBuffer)

        if (!isLastChunk) {
          buffer = buffer ? Buffer.concat([buffer, chunk]) : Buffer.concat([chunk])
          return
        }

        try {
          // @ts-expect-error ...
          const json = buffer ? JSON.parse(Buffer.concat([buffer, chunk])) : JSON.parse(chunk)
          return resolve(json)
        }
        catch {
          if (!aborted) {
            res.close()
          }
          return reject(new Error('Error JSON parse'))
        }
      })
    })
  }
}

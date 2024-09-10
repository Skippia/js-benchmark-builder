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
      const result = await this.mediator.handleRequest(
        this.mediator.targetMethod === 'POST' && await this.readJson(res, () => {
          console.log('Invalid JSON or no data at all!')
        }),
      )

      res.cork(() => {
        res.writeHeader('content-type', 'application/json').end(
          JSON.stringify(result),
        )
      })
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
  async readJson(res: HttpResponse, err: () => void): Promise<unknown> {
    return new Promise((resolve) => {
      let buffer: Buffer
      /* Register data cb */
      res.onData((ab: ArrayBuffer, isLast: boolean) => {
        const chunk = Buffer.from(ab)

        if (isLast) {
          let json
          if (buffer) {
            try {
            // @ts-expect-error ...
              json = JSON.parse(Buffer.concat([buffer, chunk]))
            }
            catch {
            /* res.close calls onAborted */
              res.close()
              return
            }
            resolve(json)
          }
          else {
            try {
            // @ts-expect-error ...
              json = JSON.parse(chunk)
            }
            catch {
            /* res.close calls onAborted */
              res.close()
              return
            }
            resolve(json)
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
    })
  }
}

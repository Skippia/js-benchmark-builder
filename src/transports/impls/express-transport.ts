import type { Server } from 'node:http'
import type { Request, Response } from 'express'
import express from 'express'
import { AbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export type ExpressContextProperties = {
  server: Server
}

export class ExpressTransport<T extends ExpressContextProperties> extends AbstractTransport<T> {
  private port: number

  constructor(port: number, mediator: Mediator<T>) {
    super(mediator)
    this.port = port
  }

  async run(): Promise<void> {
    const app = express()

    this.mediator.context = this.mediator.targetMethod === 'POST'
      ? await this.initBeforeServer([() => app.use(express.json())])
      : await this.initBeforeServer()

    // @ts-expect-error impossible to describe types
    app[this.mediator.targetMethod.toLowerCase()](this.mediator.targetPath, async (req: Request, res: Response) => {
      const result = await this.mediator.handleRequest(req.method === 'POST' && (req.body))

      res.send(result)
    })

    this.mediator.context.server = app.listen(this.port, () => {
      console.log(`Express server running on http://localhost:${this.port}`)
    })

    this.gracefulShutdown({
      closeServerCallback: () => new Promise<void>((res) => {
        this.mediator.context.server.close((err) => {
          if (!err) {
            res()
          }
        })
      }),
    })
  }
}

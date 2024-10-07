import { Buffer } from 'node:buffer'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import http from 'node:http'

import { AbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export type NodeContextProperties = {
  server: Server
}

export class NodeTransport<T extends NodeContextProperties> extends AbstractTransport<T> {
  private port: number

  constructor(port: number, mediator: Mediator<T>) {
    super(mediator)
    this.port = port
  }

  async run(): Promise<void> {
    this.mediator.context = await this.initBeforeServer()

    const handleRequest = this.mediator.buildHandleRequestWrapper(this.getRequestBody)

    // eslint-disable-next-line ts/no-misused-promises
    this.mediator.context.server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (this.mediator.targetMethod === req.method && this.mediator.targetPath === req.url) {
        try {
          const result = await handleRequest({ req, res })

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        }
        catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(err))
        }
      }
    })

    this.mediator.context.server.listen(this.port, () => {
      console.log(`Node server running on http://localhost:${this.port}`)
    })

    this.gracefulShutdown(() => new Promise<void>((resolve) => {
      this.mediator.context.server.close((err) => {
        if (!err) {
          resolve()
        }
      })
    }))
  }

  getRequestBody(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      req.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString()
        resolve(JSON.parse(body))
      })
      req.on('error', err => reject(err))
    })
  }
}

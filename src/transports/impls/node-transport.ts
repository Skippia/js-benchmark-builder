import { Buffer } from 'node:buffer'
import type { IncomingMessage, ServerResponse } from 'node:http'
import http from 'node:http'
import type { IAbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

function getRequestBody(req: IncomingMessage) {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString()
      resolve(JSON.parse(body))
    })
    req.on('error', err => reject(err))
  })
}

export class NodeTransport implements IAbstractTransport {
  constructor(readonly port: number, readonly mediator: Mediator) {
  }

  run(): void {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const response = await this.mediator.handleRequest(req.url!, req.method!, req.method === 'POST' && await getRequestBody(req))

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(response))
    })

    server.listen(this.port, () => {
      console.log(`Node.js server running on http://localhost:${this.port}`)
    })
  }
}

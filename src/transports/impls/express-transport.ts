import type { Request, Response } from 'express'
import express from 'express'
import type { IAbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export class ExpressTransport implements IAbstractTransport {
  constructor(readonly port: number, readonly mediator: Mediator) {}

  run(): void {
    const server = express()
    const { targetMethod: method, targetPath: path, run: fn, extractPayload } = this.mediator

    if (method === 'GET') {
      server.get(path, async (_req: Request, res: Response) => {
        const response = await fn()
        res.send(response)
      })
    }
    else if (method === 'POST') {
      server.use(express.json())

      server.post(path, async (req: Request, res: Response) => {
        const payload = extractPayload!(req)
        const response = await fn(payload)
        res.send(response)
      })
    }
    else {
      throw new Error('Endpoint not found')
    }

    server.listen(this.port, () => {
      console.log(`Node.js server running on http://localhost:${this.port}`)
    })
  }
}

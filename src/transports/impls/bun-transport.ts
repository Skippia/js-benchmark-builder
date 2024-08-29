import { serve } from 'bun'
import { AbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export class BunTransport extends AbstractTransport {
  private port: number

  constructor(port: number, mediator: Mediator) {
    super(mediator)
    this.port = port
  }

  async run(): Promise<void> {
    this.mediator.context = await this.init()

    serve({
      port: this.port,
      fetch: async (req: Request) => {
        const url = new URL(req.url)
        const method = req.method

        const result = await this.mediator.handleRequest(
          url.pathname,
          method,
          method === 'POST' && req.body,
        )

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    console.log(`Bun server running on http://localhost:${this.port}`)

    this.gracefulShutdown()
  }
}

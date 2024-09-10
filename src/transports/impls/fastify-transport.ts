import type { FastifyInstance, RouteHandlerMethod } from 'fastify'
import Fastify from 'fastify'
import { AbstractTransport } from '../abstract-transport'
import type { Mediator } from '../mediator'

export type FastifyContextProperties = {
  server: FastifyInstance
}

export class FastifyTransport<T extends FastifyContextProperties> extends AbstractTransport<T> {
  private port: number

  constructor(port: number, mediator: Mediator<T>) {
    super(mediator)
    this.port = port
  }

  async run(): Promise<void> {
    const fastify = Fastify({ logger: false })

    this.mediator.context = await this.initBeforeServer()

    this.mediator.context.server = fastify

    if (this.mediator.targetMethod === 'POST') {
      fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
        try {
          const json = JSON.parse(body as string)
          done(null, json)
        }
        catch (err) {
          (err as any).statusCode = 400
          done(err as Error, undefined)
        }
      })
    }
    // @ts-expect-error impossible to describe types
    fastify[this.mediator.targetMethod.toLowerCase()](this.mediator.targetPath, (async (req, reply) => {
      const result = await this.mediator.handleRequest(req.method === 'POST' && (req.body))

      reply.send(result)
    }) as RouteHandlerMethod)

    fastify.listen({ port: this.port }, (err) => {
      if (err) {
        process.exit(1)
      }

      console.log(`Fastify server running on http://localhost:${this.port}`)
    })

    this.gracefulShutdown({
      closeServerCallback: () => this.mediator.context.server.close(),
    })
  }
}

import Fastify from 'fastify'

export function run(port) {
  const fastify = Fastify({
    logger: false,
  })

  fastify.get('/heavy-non-blocking', async (request, reply) => {
    reply
      .header('Content-Type', 'application/json')
      .send(heavyNonBlockingTask())
  })

  fastify.listen({ port }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Fastify server running on ${address}`)
  })
}

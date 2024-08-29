import Fastify from 'fastify'

const PORT = process.env.PORT

const fastify = Fastify({
  logger: false
})

fastify.get('/empty-request', async (request, reply) => {
  reply.send('')
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Fastify server running on ${address}`)
})

import Fastify from 'fastify'

const PORT = process.env.PORT

const fastify = Fastify({
  logger: false
})

fastify.get('/json-parse-request', async (request, reply) => {
  const data = JSON.parse("{ hello: 'world', music: 'listen', door: 'close', number: 42, success: true, timestamp: new Date().toISOString() }")

  reply
    .send(data)
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Fastify server running on ${address}`)
})

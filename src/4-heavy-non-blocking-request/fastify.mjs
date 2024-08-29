import Fastify from 'fastify'
import { heavyNonBlockingTask } from '../shared/index.mjs'

const PORT = process.env.PORT

const fastify = Fastify({
  logger: false
})

fastify.get('/empty-request', async (request, reply) => {
  const result = heavyNonBlockingTask()

  reply
    .send(result)
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Fastify server running on ${address}`)
})

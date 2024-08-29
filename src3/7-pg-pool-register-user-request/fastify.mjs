import Fastify from 'fastify'
import { createUser, pgPoolClient } from '../infra/pg.mjs'

const PORT = process.env.PORT
const fastify = Fastify({ logger: false })

fastify.post('/user', async (request, reply) => {
  try {
    const { email, password } = request.body
    const userId = await createUser(pgPoolClient)(email, password)

    reply
      .code(201)
      .send({ message: 'User created', userId })
  }
  catch (error) {
    fastify.log.error(error)
    reply.code(error instanceof SyntaxError ? 400 : 500).send({ error: error.message })
  }
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Server running at ${address}`)
})

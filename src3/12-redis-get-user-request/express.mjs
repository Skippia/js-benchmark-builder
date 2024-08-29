import express from 'express'
import { createUser, getUser, redisClient } from '../infra/redis.mjs'

const port = process.env.PORT

if (!(await redisClient.get('user'))) {
  await createUser(redisClient)({ email: 'randomuser@gmail.com', password: 'hello123' })
}

const app = express()

app.get('/user', async (req, res) => {
  try {
    const user = await getUser(redisClient)

    res.status(201).json({ user })
  }
  catch (error) {
    console.error(error)
    res.status(error instanceof SyntaxError ? 400 : 500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})

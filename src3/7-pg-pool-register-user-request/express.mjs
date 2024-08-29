import express from 'express'
import { createUser, pgPoolClient } from '../infra/pg.mjs'

const PORT = process.env.PORT
const app = express()

app.use(express.json())

app.post('/user', async (req, res) => {
  try {
    const { email, password } = req.body
    const userId = await createUser(pgPoolClient)(email, password)

    res.status(201).json({ message: 'User created', userId })
  }
  catch (error) {
    console.error(error)
    res.status(error instanceof SyntaxError ? 400 : 500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})

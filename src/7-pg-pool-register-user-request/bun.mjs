import { serve } from "bun"
import { initPool, createUser } from "./shared.mjs"

const PORT = process.env.PORT
const pool = initPool()

serve({
  port: PORT,
  async fetch(req) {
    if (req.method === "POST" && req.url === "/user") {
      try {
        const { email, password } = await req.json()
        const userId = await createUser(pool)(email, password)

        return new Response(JSON.stringify({ message: "User created", userId }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: error instanceof SyntaxError ? 400 : 500,
          headers: {
            "Content-Type": "application/json",
            "Connection": "close",
          },
        })
      }
    }
  },
})

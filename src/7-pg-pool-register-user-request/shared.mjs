import pg from "pg"

export const initPool = () => new pg.Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  database: process.env.POSTGRES_DATABASE,
  max: 60,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
  ssl:
    process.env.NODE_ENV === "development"
      ? false
      : {
        rejectUnauthorized: false,
      },
})


export const createUser = (pool) => async (email, password) => {
  const queryText = "INSERT INTO users(email, password) VALUES($1, $2) RETURNING id"
  const { rows } = await pool.query(queryText, [email, password])
  
  return rows[0].id
}

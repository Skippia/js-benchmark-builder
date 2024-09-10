import pg from 'pg';
function initPgPool() {
    const config = {
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        port: 5432,
        database: process.env.POSTGRES_DB,
        max: 200,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5000,
        ssl: false,
    };
    return new pg.Pool(config);
}
export const pgPoolClient = initPgPool();
export function createUser(pool) {
    return async ({ email, password }) => {
        const queryText = 'INSERT INTO users (email, password) VALUES($1, $2) RETURNING id';
        const { rows } = await pool.query(queryText, [email, password]);
        return rows[0].id;
    };
}
export async function getUser(pool) {
    const queryText = 'SELECT * FROM users LIMIT 1';
    const { rows } = await pool.query(queryText);
    return rows[0];
}

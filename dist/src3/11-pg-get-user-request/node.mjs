import http from 'node:http';
import { createUser, getUser, pgPoolClient } from '../infra/pg.mjs';
const port = process.env.PORT;
if (!(await getUser(pgPoolClient))) {
    await createUser(pgPoolClient)({ email: 'randomuser@gmail.com', password: 'hello123' });
}
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/user') {
        const user = await getUser(pgPoolClient);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    }
});
server.listen(port, () => {
    console.log(`Node.js server running on http://localhost:${port}`);
});

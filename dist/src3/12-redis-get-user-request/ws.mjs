import { App } from 'uWebSockets.js';
import { createUser, getUser, redisClient } from '../infra/redis.mjs';
const port = +process.env.PORT;
const app = App();
if (!(await getUser(redisClient))) {
    await createUser(redisClient)({ email: 'randomuser@gmail.com', password: 'hello123' });
}
app.get('/user', async (res) => {
    res.onAborted(() => {
        res.aborted = true;
    });
    const user = await getUser(redisClient);
    if (!res.aborted) {
        res.cork(() => {
            res.writeHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(user));
        });
    }
}).listen(port, (token) => {
    if (token) {
        console.log(`Secret server running on http://localhost:${port}`);
    }
    else {
        console.log(`Failed to listen to port ${port}`);
    }
});

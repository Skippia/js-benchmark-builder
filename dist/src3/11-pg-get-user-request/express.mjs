import express from 'express';
import { createUser, getUser } from '../infra/pg.mjs';
const PORT = process.env.PORT;
const app = express();
if (!(await getUser(pgPoolClient))) {
    await createUser(pgPoolClient)({ email: 'randomuser@gmail.com', password: 'hello123' });
}
app.get('/user', async (req, res) => {
    try {
        const user = await getUser(pgPoolClient);
        res.status(201).json({ user });
    }
    catch (error) {
        console.error(error);
        res.status(error instanceof SyntaxError ? 400 : 500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

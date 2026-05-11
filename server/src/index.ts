import express from 'express';
import { createServer } from 'node:http';
import 'dotenv/config';

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(process.env.PORT, () => {
    console.log(`Server ish running on port ${process.env.PORT} uwu`);
})
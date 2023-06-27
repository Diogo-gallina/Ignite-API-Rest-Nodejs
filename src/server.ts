import fastify from "fastify";
import { knex } from "./database";
import crypto from "node:crypto";

const app = fastify();

app.get('/hello', async () => {
    const transaction = await knex('transactions')
    .where('amount', 1000)
    .select('*');

    return transaction;
});

app.listen({
    port: 3333
}).then(() => {
    console.log('HTTP Server Running!');
})
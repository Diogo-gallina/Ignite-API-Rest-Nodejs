import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";
import { request } from "http";

export async function transactionsRoutes(app: FastifyInstance) {
    
    app.get('/summary', async (request, reply) => {
        const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .first();

        return { summary };
    })

    app.get('/', async () => {
        const transactions = await knex('transactions')
            .select()

        return {
            transactions
        };
    });

    app.get('/:id', async (request) => {

        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getTransactionsParamsSchema.parse(request.params);

        const transactions = await knex('transactions').where('id', id).first();

        return { transactions };
    });
    
    app.post('/', async (request, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body,
        )

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }

        await knex('transactions')
        .insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send();
    });

    app.delete('/:id', async (request, reply) => {
        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const { id } = getTransactionsParamsSchema.parse(request.params);

        const transactions = await knex('transactions').where('id', id).delete();

        return reply.status(201).send();
    });

}
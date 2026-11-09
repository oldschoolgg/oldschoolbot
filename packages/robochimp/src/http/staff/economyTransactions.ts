import { ZEconomyTransactionsQuery } from '@oldschoolgg/schemas';
import { Hono } from 'hono';

import { ensureAuthenticated, ensureModeratorUser } from '@/http/middlewares.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const economyTransactionServer = new Hono<HonoServerGeneric>();
economyTransactionServer.use(ensureAuthenticated);
economyTransactionServer.use(ensureModeratorUser);

economyTransactionServer.post('/', async c => {
	const body = await c.req.json();

	const parseResult = ZEconomyTransactionsQuery.safeParse(body);
	if (!parseResult.success) {
		return httpErr.BAD_REQUEST({ message: JSON.parse(parseResult.error.message) });
	}

	const query = parseResult.data;

	const where: any = {};

	if (query.sender) {
		const senderIds = query.sender.split(',').map(id => BigInt(id.trim()));
		where.sender = senderIds.length === 1 ? senderIds[0] : { in: senderIds };
	}

	if (query.recipient) {
		where.recipient = BigInt(query.recipient);
	}

	if (query.guild_id) {
		where.guild_id = BigInt(query.guild_id);
	}

	if (query.type) {
		where.type = query.type;
	}

	if (query.date_from || query.date_to) {
		where.date = {};
		if (query.date_from) {
			where.date.gte = new Date(query.date_from);
		}
		if (query.date_to) {
			where.date.lte = new Date(query.date_to);
		}
	}

	const limit = Number(query.limit);
	const offset = Number(query.offset);

	const orderBy = { [query.sort_by]: query.sort_order };
	try {
		const [transactions, total] =
			query.bot === 'osb'
				? await Promise.all([
						osbClient.economyTransaction.findMany({
							where,
							orderBy,
							take: limit,
							skip: offset
						}),
						osbClient.economyTransaction.count({ where })
					])
				: await Promise.all([
						bsoClient.economyTransaction.findMany({
							where,
							orderBy,
							take: limit,
							skip: offset
						}),
						bsoClient.economyTransaction.count({ where })
					]);
		const serializedTransactions = transactions.map(tx => ({
			...tx,
			sender: tx.sender.toString(),
			recipient: tx.recipient.toString(),
			guild_id: tx.guild_id?.toString() ?? null
		}));

		return httpRes.JSON({
			data: serializedTransactions,
			pagination: {
				total,
				limit,
				offset,
				has_more: offset + limit < total
			}
		});
	} catch (error) {
		console.error('Error fetching economy transactions:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to fetch economy transactions' });
	}
});

economyTransactionServer.get('/:id', async c => {
	const { id } = c.req.param();

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(id)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid transaction ID. Must be a valid UUID' });
	}

	try {
		const transaction = await osbClient.economyTransaction.findUnique({
			where: { id }
		});

		if (!transaction) {
			return httpErr.NOT_FOUND({ message: 'Transaction not found' });
		}

		const serializedTransaction = {
			...transaction,
			sender: transaction.sender.toString(),
			recipient: transaction.recipient.toString(),
			guild_id: transaction.guild_id?.toString() ?? null
		};

		return httpRes.JSON({ data: serializedTransaction });
	} catch (error) {
		console.error('Error fetching economy transaction:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to fetch economy transaction' });
	}
});

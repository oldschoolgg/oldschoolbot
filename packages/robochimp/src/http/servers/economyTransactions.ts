import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';
import { z } from 'zod';

import { ensureAuthenticated, ensureModeratorUser } from '@/http/middlewares.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const economyTransactionServer = new Hono<HonoServerGeneric>();
economyTransactionServer.use(ensureAuthenticated);
economyTransactionServer.use(ensureModeratorUser);

const economyTransactionTypeEnum = z.enum(['trade', 'giveaway', 'duel', 'gri', 'gift']);

const sortFieldEnum = z.enum(['date', 'sender', 'recipient', 'type', 'guild_id']);
const sortOrderEnum = z.enum(['asc', 'desc']);

const querySchema = z.object({
	bot: z.enum(['osb', 'bso']),
	sender: z
		.string()
		.optional()
		.refine(val => !val || val.split(',').every(id => isValidDiscordSnowflake(id.trim())), {
			message: 'Invalid sender ID(s). Must be valid Discord snowflake(s)'
		}),
	recipient: z
		.string()
		.optional()
		.refine(val => !val || isValidDiscordSnowflake(val), {
			message: 'Invalid recipient ID. Must be a valid Discord snowflake'
		}),
	guild_id: z
		.string()
		.optional()
		.refine(val => !val || isValidDiscordSnowflake(val), {
			message: 'Invalid guild ID. Must be a valid Discord snowflake'
		}),
	type: economyTransactionTypeEnum.optional(),
	date_from: z
		.string()
		.optional()
		.refine(
			val => {
				if (!val) return true;
				const date = new Date(val);
				return !isNaN(date.getTime());
			},
			{ message: 'Invalid date_from format. Must be a valid ISO 8601 date string' }
		),
	date_to: z
		.string()
		.optional()
		.refine(
			val => {
				if (!val) return true;
				const date = new Date(val);
				return !isNaN(date.getTime());
			},
			{ message: 'Invalid date_to format. Must be a valid ISO 8601 date string' }
		),

	sort_by: sortFieldEnum.optional().default('date'),
	sort_order: sortOrderEnum.optional().default('desc'),

	limit: z
		.string()
		.optional()
		.default('50')
		.refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 1000, {
			message: 'Limit must be a number between 1 and 1000'
		}),
	offset: z
		.string()
		.optional()
		.default('0')
		.refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
			message: 'Offset must be a non-negative number'
		})
});

economyTransactionServer.get('/', async c => {
	const rawQuery = c.req.query();

	const parseResult = querySchema.safeParse(rawQuery);
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

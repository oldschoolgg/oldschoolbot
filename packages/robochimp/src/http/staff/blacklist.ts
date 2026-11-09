import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';
import { z } from 'zod';

import { ensureAuthenticated, ensureModeratorUser } from '@/http/middlewares.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const blacklistServer = new Hono<HonoServerGeneric>();
blacklistServer.use(ensureAuthenticated);
blacklistServer.use(ensureModeratorUser);

const blacklistedEntityTypeEnum = z.enum(['guild', 'user']);

blacklistServer.get('/users', async c => {
	try {
		const blacklistedUsers = await c.get('prisma').blacklistedEntity.findMany({
			where: { type: 'user' },
			orderBy: { date: 'desc' }
		});

		const data: [string, number, string | null][] = blacklistedUsers.map(entity => [
			entity.id.toString(),
			Math.floor(entity.date.getTime() / 1000),
			entity.reason
		]);

		return httpRes.JSON(data);
	} catch (error) {
		console.error('Error fetching blacklisted users:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to fetch blacklisted users' });
	}
});

blacklistServer.get('/guilds', async c => {
	try {
		const blacklistedGuilds = await c.get('prisma').blacklistedEntity.findMany({
			where: { type: 'guild' },
			orderBy: { date: 'desc' }
		});

		const data: [string, number, string | null][] = blacklistedGuilds.map(entity => [
			entity.id.toString(),
			Math.floor(entity.date.getTime() / 1000),
			entity.reason
		]);

		return httpRes.JSON(data);
	} catch (error) {
		console.error('Error fetching blacklisted guilds:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to fetch blacklisted guilds' });
	}
});

const addBlacklistSchema = z.object({
	id: z.string().refine(val => isValidDiscordSnowflake(val), {
		message: 'Invalid ID. Must be a valid Discord snowflake'
	}),
	type: blacklistedEntityTypeEnum,
	reason: z.string().optional()
});

blacklistServer.put('/', async c => {
	const body = await c.req.json().catch(() => null);
	if (!body) {
		return httpErr.BAD_REQUEST({ message: 'Invalid request body' });
	}

	const parseResult = addBlacklistSchema.safeParse(body);
	if (!parseResult.success) {
		return httpErr.BAD_REQUEST({ message: JSON.parse(parseResult.error.message) });
	}

	const { id, type, reason } = parseResult.data;

	try {
		const existing = await c.get('prisma').blacklistedEntity.findUnique({
			where: { id: BigInt(id) }
		});

		if (existing) {
			return httpErr.BAD_REQUEST({ message: 'Entity is already blacklisted' });
		}

		const blacklistedEntity = await c.get('prisma').blacklistedEntity.create({
			data: {
				id: BigInt(id),
				type,
				reason: reason ?? null
			}
		});

		const serializedEntity = {
			...blacklistedEntity,
			id: blacklistedEntity.id.toString()
		};

		return httpRes.JSON({ data: serializedEntity });
	} catch (error) {
		console.error('Error adding blacklisted entity:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to add blacklisted entity' });
	}
});

blacklistServer.delete('/:id', async c => {
	const { id } = c.req.param();

	if (!isValidDiscordSnowflake(id)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid ID. Must be a valid Discord snowflake' });
	}

	try {
		const existing = await c.get('prisma').blacklistedEntity.findUnique({
			where: { id: BigInt(id) }
		});

		if (!existing) {
			return httpErr.NOT_FOUND({ message: 'Entity is not blacklisted' });
		}

		await c.get('prisma').blacklistedEntity.delete({
			where: { id: BigInt(id) }
		});

		return httpRes.JSON({ message: 'Entity removed from blacklist' });
	} catch (error) {
		console.error('Error removing blacklisted entity:', error);
		return httpErr.BAD_REQUEST({ message: 'Failed to remove blacklisted entity' });
	}
});

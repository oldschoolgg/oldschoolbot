import { isValidDiscordSnowflake } from '@oldschoolgg/toolkit';
import { Hono } from 'hono';

import { Err, type HonoServerGeneric, Res } from './lib/helpers.js';

export const userServer = new Hono<HonoServerGeneric>();

userServer.get('/:id', async c => {
	const userId = c.req.param('id');
	if (!userId) {
		return c.json({ error: 'User ID is required' }, 400);
	}

	if (!isValidDiscordSnowflake(userId)) {
		return Err.BAD_REQUEST({ message: 'Invalid User ID' });
	}

	return Res.JSON({ user: { id: userId } });
});

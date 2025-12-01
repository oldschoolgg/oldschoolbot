import { Hono } from 'hono';

import { ensureAuthenticated } from '@/http/middlewares.js';
import { type HonoServerGeneric, httpErr, httpRes } from '@/http/serverUtil.js';

export const discordServer = new Hono<HonoServerGeneric>();

discordServer.get('/users', ensureAuthenticated, async c => {
	const username = c.req.query('username');

	if (!username || typeof username !== 'string' || username.trim().length === 0) {
		return httpErr.BAD_REQUEST({ message: 'Username query parameter is required' });
	}

	const users = await roboChimpClient.discordUser.findMany({
		where: {
			OR: [
				{
					username: {
						contains: username,
						mode: 'insensitive'
					}
				},
				{
					global_name: {
						contains: username,
						mode: 'insensitive'
					}
				}
			]
		},
		take: 20,
		orderBy: {
			created_at: 'desc'
		}
	});

	return httpRes.JSON({
		results: users.map(user => ({
			id: user.id,
			username: user.username,
			global_name: user.global_name,
			avatar: user.avatar
		})),
		count: users.length
	});
});

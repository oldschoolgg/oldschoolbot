import { serve } from '@hono/node-server';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { attachUser } from '@/http/middlewares.js';
import { discordServer } from '@/http/servers/discord.js';
import { oauthHonoServer } from '@/http/servers/oauth.js';
import { userServer } from '@/http/servers/users.js';
import { webhooksServer } from '@/http/servers/webhooks.js';
import type { HonoServerGeneric } from '@/http/serverUtil.js';
import { staffServer } from '@/http/staff/staff.js';
import { fetchFullMinionData } from '@/lib/fullMinionData.js';
import { globalConfig } from '../constants.js';

export async function startServer(port: number) {
	const app = new Hono<HonoServerGeneric>();

	app.use(
		cors({
			origin: (origin: string) => {
				if (!origin) return globalConfig.frontendUrl;
				if (origin === globalConfig.frontendUrl) return origin;
				if (process.env.NODE_ENV !== 'production') {
					if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
						return origin;
					}
				}
				return globalConfig.frontendUrl;
			},
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'x-patreon-signature', 'x-hub-signature'],
			credentials: true
		})
	);

	app.use('*', attachUser);
	app.use('*', async (c, next) => {
		c.set('prisma', roboChimpClient);
		c.set('client', globalClient);
		console.log(`${c.req.method} ${c.req.url}`);
		return next();
	});

	// Public minion snapshot route used by wiki widgets.
	app.get('/minion/:userId', async c => {
		const { userId } = c.req.param();
		if (!isValidDiscordSnowflake(userId)) {
			return c.json({ message: 'Invalid user ID. Must be a valid Discord snowflake' }, 400);
		}

		const data = await fetchFullMinionData('osb', userId);
		if (!data) {
			return c.json({ message: 'Minion data not found for this user' }, 404);
		}

		return c.json(data);
	});

	app.route('/staff', staffServer);
	app.route('/oauth', oauthHonoServer);
	app.route('/discord', discordServer);
	app.route('/webhooks', webhooksServer);
	app.route('/user', userServer);

	serve({ fetch: app.fetch, port });
	return app;
}

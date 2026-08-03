import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { attachUser } from '@/http/middlewares.js';
import { discordServer } from '@/http/servers/discord.js';
import { oauthHonoServer } from '@/http/servers/oauth.js';
import { userServer } from '@/http/servers/users.js';
import type { HonoServerGeneric } from '@/http/serverUtil.js';
import { staffServer } from '@/http/staff/staff.js';
import { globalConfig } from '../constants.js';

export async function startServer(port: number) {
	const { webhooksServer } =
		process.env.DEBUG === '1'
			? await import('@/http/servers/webhooks.debug.js')
			: await import('@/http/servers/webhooks.js');
	const app = new Hono<HonoServerGeneric>();

	app.use(
		cors({
			origin: globalConfig.frontendUrl,
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'x-patreon-signature', 'x-hub-signature'],
			credentials: true
		})
	);

	app.use('*', attachUser);
	app.use('*', async (c, next) => {
		c.set('prisma', roboChimpClient);
		c.set('client', globalClient);
		console.log(`Webhooks: ${c.req.method} ${c.req.path} ${c.req.url}`);
		return next();
	});

	app.route('/staff', staffServer);
	app.route('/oauth', oauthHonoServer);
	app.route('/discord', discordServer);
	app.route('/webhooks', webhooksServer);
	app.route('/user', userServer);

	serve({ fetch: app.fetch, port });
	return app;
}

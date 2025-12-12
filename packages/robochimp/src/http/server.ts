import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { attachUser } from '@/http/middlewares.js';
import { discordServer } from '@/http/servers/discord.js';
import { economyTransactionServer } from '@/http/servers/economyTransactions.js';
import { minionServer } from '@/http/servers/minion.js';
import { oauthHonoServer } from '@/http/servers/oauth.js';
import { webhooksServer } from '@/http/servers/webhooks.js';
import type { HonoServerGeneric } from '@/http/serverUtil.js';
import { globalConfig } from '../constants.js';

export async function startServer() {
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
		console.log(`${c.req.method} ${c.req.url}`);
		return next();
	});

	app.route('/economy-transactions', economyTransactionServer);
	app.route('/oauth', oauthHonoServer);
	app.route('/discord', discordServer);
	app.route('/webhooks', webhooksServer);
	app.route('/minion', minionServer);

	serve({ fetch: app.fetch, port: globalConfig.httpPort });
	return app;
}

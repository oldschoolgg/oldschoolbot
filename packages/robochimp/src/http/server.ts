import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { attachUser } from '@/http/middlewares.js';
import { discordServer } from '@/http/servers/discord.js';
import { minionServer } from '@/http/servers/minion.js';
import { oauthHonoServer } from '@/http/servers/oauth.js';
import { webhooksServer } from '@/http/servers/webhooks.js';
import type { HonoServerGeneric } from '@/http/serverUtil.js';
import { staffServer } from '@/http/staff/staff.js';
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
	app.use('*', async (c, _next) => {
		if (c.req.method === 'OPTIONS') {
			return c.text('OK');
		}
		c.set('prisma', roboChimpClient);

		const target = `${c.req.url.replace('http://osgtestapi.magnaboy.com', 'https://api.oldschool.gg')}`;
		console.log(`Proxying request: ${c.req.method} ${c.req.url} -> ${target}`);

		const proxiedRes = await fetch(target, {
			headers: {
				Cookie: 'g'
			}
		}).then(res => res.json());

		return c.json(proxiedRes);
		// console.log(`${c.req.method} ${c.req.url}`);
		// return next();
		// console.log(`${c.req.method} ${c.req.url}`);
		// return next();
	});

	app.route('/staff', staffServer);
	app.route('/oauth', oauthHonoServer);
	app.route('/discord', discordServer);
	app.route('/webhooks', webhooksServer);
	app.route('/minion', minionServer);

	serve({ fetch: app.fetch, port: globalConfig.httpPort });
	return app;
}

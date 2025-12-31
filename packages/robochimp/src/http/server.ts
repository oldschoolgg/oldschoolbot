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
		if (c.req.method === 'OPTIONS') {
			return c.text('OK');
		}


		const target = `${c.req.url.replace("http://osgtestapi.magnaboy.com", "https://api.oldschool.gg")}`;
		console.log(`Proxying request: ${c.req.method} ${c.req.url} -> ${target}`);

		const proxiedRes = (await fetch(target, {
			headers: {
				Cookie: 'token=O1cpKwlkHr4E5BI8C0236SZWQ8bG4saHTJrl1RQ2jzuXpsJTsr9hLDcckaq5Y6aSKsdLKq4Rp%2B1%2BmRRK1YpZ28rsL5RghNDpRRATjrvL9OtpakMwgTOiY5WoRbWe8F4eDQc9N%2F%2Fm%2F82u9xkp%2BMA3w7vNIPA54fncrzRmALR6YXDEr9QxtVluBsGXH3uv6amX8aAzXHhcFKfmVK3VwUI6DJqvww4NzKlUxgj3s2ierVw%3D'
			}
		}).then(res => res.json()));

		return c.json(proxiedRes);
		// console.log(`${c.req.method} ${c.req.url}`);
		// return next();
	});

	app.route('/economy-transactions', economyTransactionServer);
	app.route('/oauth', oauthHonoServer);
	app.route('/discord', discordServer);
	app.route('/webhooks', webhooksServer);
	app.route('/minion', minionServer);

	serve({ fetch: app.fetch, port: globalConfig.httpPort });
	return app;
}

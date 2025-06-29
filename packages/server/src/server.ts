import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { Hono } from 'hono';

import { Err } from './lib/helpers.js';
import { userServer } from './user.js';

type HonoServerGeneric = { Bindings: {}; Variables: {} };

const honoApp = new Hono<HonoServerGeneric>();

const ignoredPaths = new Set();
const blacklistedPathSegments = ['wp-', '.php'];

honoApp.use('*', async (c, next) => {
	if (blacklistedPathSegments.some(str => c.req.path.includes(str))) {
		return new Response(undefined, { status: 403 });
	}
	if (!ignoredPaths.has(c.req.path)) {
		const ip = c.req.header('Cf-Connecting-Ip') ?? getConnInfo(c)?.remote?.address ?? c.req.header('User-Agent')!;
		console.log(`[${c.req.method}] [${c.req.header('Origin')}] ${c.req.path} [${ip}]`);
	}

	await next();
});

honoApp.route('/user', userServer);

honoApp.all('*', async () => {
	return Err.NOT_FOUND();
});

export function startServer() {
	return serve({
		fetch: honoApp.fetch,
		port: 3388
	});
}

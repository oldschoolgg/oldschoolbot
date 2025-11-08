import { serve } from '@hono/node-server';
import { isValidDiscordSnowflake } from '@oldschoolgg/toolkit';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { httpErr, httpRes } from '@/http/serverUtil.js';
import { RUser } from '@/structures/RUser.js';
import { globalConfig } from '../constants.js';
import { type GithubSponsorsWebhookData, verifyGithubSecret } from '../lib/githubSponsor.js';
import { parseStrToTier, patreonTask, verifyPatreonSecret } from '../lib/patreon.js';
import { patronLogWebhook } from '../util.js';

export async function startServer() {
	const app = new Hono();

	app.use(
		'*',
		cors({
			origin: '*',
			allowMethods: ['GET', 'POST', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'x-patreon-signature', 'x-hub-signature']
		})
	);

	app.use('*', async (c, next) => {
		console.log(`${c.req.method} ${c.req.url}`);
		return next();
	});

	app.post('/webhooks/patreon', async c => {
		const signature = c.req.header('x-patreon-signature');
		if (!signature) return httpErr.BAD_REQUEST({ message: 'Missing header' });

		const raw = await c.req.text();
		if (!raw || typeof raw !== 'string') {
			return httpErr.BAD_REQUEST({ message: 'Missing body' });
		}

		const isVerified = verifyPatreonSecret(raw, signature);
		if (!isVerified) return httpErr.BAD_REQUEST({ message: 'Unverified' });

		// biome-ignore lint/nursery/noFloatingPromises:-
		patreonTask.run().then(res => {
			if (res) {
				patronLogWebhook.send(res.join('\n').slice(0, 1950));
			}
		});

		return c.text('OK');
	});

	app.post('/webhooks/github', async c => {
		const sig = c.req.header('x-hub-signature');
		const raw = await c.req.text();

		let parsed: GithubSponsorsWebhookData | null = null;
		try {
			parsed = JSON.parse(raw) as GithubSponsorsWebhookData;
		} catch {
			return httpErr.BAD_REQUEST();
		}

		const isVerified = verifyGithubSecret(JSON.stringify(parsed), sig);
		if (!isVerified) return httpErr.BAD_REQUEST();

		const data = parsed;
		const user = await roboChimpClient.user.findFirst({
			where: { github_id: Number(data.sender.id) }
		});

		switch (data.action) {
			case 'created': {
				const tier = parseStrToTier(data.sponsorship.tier.name);
				if (!tier) break;
				if (user) await patreonTask.changeTier(new RUser(user), tier);
				break;
			}
			case 'tier_changed':
			case 'pending_tier_change': {
				const to = parseStrToTier(data.sponsorship.tier.name);
				if (!to) break;
				if (user) await patreonTask.changeTier(new RUser(user), to);
				break;
			}
			case 'cancelled': {
				const tier = parseStrToTier(data.sponsorship.tier.name);
				if (!tier) break;
				if (user) await patreonTask.removePerks(new RUser(user), 'Cancelled');
				break;
			}
			default:
				break;
		}

		return c.text('OK');
	});

	app.get('/minion/:userID', async c => {
		const params = c.req.param();
		const queryBot = c.req.query('bot');
		let userID = params.userID;

		if (!userID || typeof userID !== 'string') {
			return httpErr.BAD_REQUEST({ message: 'Invalid user ID 1' });
		}

		if (!isValidDiscordSnowflake(userID)) {
			const djsUser = globalClient.users.cache.find((u: any) => u.username === userID);
			if (djsUser) userID = djsUser.id;
			else return httpErr.NOT_FOUND({ message: 'Could not find this users id' });
		}

		if (!userID || !isValidDiscordSnowflake(userID)) {
			return httpErr.BAD_REQUEST({ message: 'Invalid user ID 3' });
		}

		const _osb = queryBot !== 'bso';
		const args = {
			where: { id: userID },
			select: { id: true, completed_ca_task_ids: true, minion_ironman: true }
		} as const;

		const roboChimpUser = await roboChimpClient.user.findFirst({
			where: { id: BigInt(userID) }
		});

		const user = await (_osb ? osbClient.user.findFirst(args) : bsoClient.user.findFirst(args));
		if (!user || !roboChimpUser) return httpErr.NOT_FOUND({ message: 'User not found' });

		return httpRes.JSON({
			id: user.id,
			completed_ca_task_ids: user.completed_ca_task_ids,
			is_ironman: user.minion_ironman,
			leagues_completed_tasks_ids: roboChimpUser.leagues_completed_tasks_ids
		});
	});

	serve({ fetch: app.fetch, port: globalConfig.httpPort });
	return app;
}

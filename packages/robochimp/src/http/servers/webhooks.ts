import { Hono } from 'hono';

import { type HonoServerGeneric, httpErr } from '@/http/serverUtil.js';
import { type GithubSponsorsWebhookData, verifyGithubSecret } from '@/lib/githubSponsor.js';
import { parseStrToTier, patreonTask, verifyPatreonSecret } from '@/lib/patreon.js';
import { RUser } from '@/structures/RUser.js';

export const webhooksServer = new Hono<HonoServerGeneric>();

webhooksServer.post('/patreon', async c => {
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
			console.log(res.join('\n').slice(0, 1950));
		}
	});

	return c.text('OK');
});

webhooksServer.post('/github', async c => {
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

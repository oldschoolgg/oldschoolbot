import { createHmac, timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';

import { globalConfig } from '@/constants.js';
import { type HonoServerGeneric, httpErr } from '@/http/serverUtil.js';
import { type GithubSponsorsWebhookData, verifyGithubSecret } from '@/lib/githubSponsor.js';
import {
	getVerifiedPatreonCampaign,
	handlePatreonWebhook,
	isPatreonEvent,
	logIgnoredPatreonWebhook,
	parseStrToTier,
	patreonTask
} from '@/lib/patreon.js';
import { RUser } from '@/structures/RUser.js';
import { cyrTiers } from '@/util.js';

export const webhooksServer = new Hono<HonoServerGeneric>();

const cyrPaymentSignatureHeader = 'x-cyr-payment-signature';
const discordIDRegex = /^\d{17,20}$/;
const sha256HexRegex = /^[a-f\d]{64}$/i;
type CyrPaymentPerk = { number: number; isCyr: boolean; isGift?: true };

function verifyCyrPaymentSignature(raw: string, signature: string | undefined) {
	if (!signature?.startsWith('sha256=')) return false;

	const expected = createHmac('sha256', globalConfig.cyrPaymentWebhookSecret).update(raw).digest('hex');
	const received = signature.slice('sha256='.length);
	if (!sha256HexRegex.test(received)) return false;
	return timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'));
}

webhooksServer.post('/get-user-entitlements', async c => {
	const raw = await c.req.text();
	if (!verifyCyrPaymentSignature(raw, c.req.header(cyrPaymentSignatureHeader))) {
		return httpErr.UNAUTHORIZED({ message: 'Invalid signature' });
	}

	let discordID: unknown;
	try {
		discordID = (JSON.parse(raw) as { discordID?: unknown }).discordID;
	} catch {
		return httpErr.BAD_REQUEST({ message: 'Invalid body' });
	}
	if (typeof discordID !== 'string' || !discordIDRegex.test(discordID)) {
		return httpErr.BAD_REQUEST({ message: 'Invalid Discord ID' });
	}

	const user = await roboChimpClient.user.findUnique({
		where: { id: BigInt(discordID) },
		select: {
			bits: true,
			premium_balance_tier: true,
			premium_balance_is_cyr: true,
			premium_balance_expiry_date: true
		}
	});
	if (!user) return httpErr.NOT_FOUND({ message: 'Robochimp user not found' });

	const cyrPatreonTier = cyrTiers.find(tier => user.bits.includes(tier.bit));
	const perks: CyrPaymentPerk[] = cyrPatreonTier ? [{ number: cyrPatreonTier.number, isCyr: true }] : [];
	const isActivePremium =
		user.premium_balance_tier !== null &&
		user.premium_balance_expiry_date !== null &&
		Number(user.premium_balance_expiry_date) > Date.now();
	if (isActivePremium) {
		perks.push({
			number: user.premium_balance_tier! - 1,
			isCyr: Boolean(user.premium_balance_is_cyr),
			isGift: true
		});
	}

	const hasCyrTier6Or7 = perks.some(perk => perk.isCyr && perk.number >= 6);
	if (!hasCyrTier6Or7) {
		return httpErr.FORBIDDEN({ message: 'Cyr Patreon Tier 6 or 7 is required' });
	}

	return c.json(perks);
});

webhooksServer.post('/patreon', async c => {
	const signature = c.req.header('x-patreon-signature');
	if (!signature) return httpErr.BAD_REQUEST({ message: 'Missing header' });

	const raw = await c.req.text();
	if (!raw) {
		return httpErr.BAD_REQUEST({ message: 'Missing body' });
	}

	console.log('Patreon webhook coming in...');
	const campaign = getVerifiedPatreonCampaign(raw, signature);
	if (!campaign) return httpErr.BAD_REQUEST({ message: 'Unverified' });

	const patreonEvent = c.req.header('X-Patreon-Event');
	if (!isPatreonEvent(patreonEvent)) {
		console.log(`Ignoring Patreon webhook event ${patreonEvent ?? 'unknown'}.`);
		await logIgnoredPatreonWebhook(raw, patreonEvent ?? null, campaign);
		return c.text('OK');
	}

	console.log(`Verified Patreon ${patreonEvent} webhook for ${campaign.source}.`);
	try {
		const result = await handlePatreonWebhook(raw, patreonEvent, campaign);
		if (result) {
			console.log(result.slice(0, 1950));
		}
	} catch (err) {
		console.error(err);
		return httpErr.BAD_REQUEST({ message: 'Invalid Patreon webhook body' });
	}

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

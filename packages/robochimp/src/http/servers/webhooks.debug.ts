import { PerkTier, uniqueArr } from '@oldschoolgg/toolkit';
import type { User } from '@prisma/robochimp';
import { Hono } from 'hono';

import { type HonoServerGeneric, httpErr } from '@/http/serverUtil.js';
import { type GithubSponsorsWebhookData, verifyGithubSecret } from '@/lib/githubSponsor.js';
import {
	type CampaignConfig,
	createPatreonWebhookLog,
	getVerifiedPatreonCampaign,
	isPatreonEvent,
	type PatreonWebhookEvent,
	parseStrToTier
} from '@/lib/patreon.js';
import { Bits, type PaidTierSource, type PatronTier, paidTiers } from '@/util.js';

type DebugUser = User & {
	debugUsername?: string;
};

type PatreonDebugMember = {
	source: PaidTierSource;
	patreonID: string;
	discordID: string | null;
	entitledTier: PatronTier | null;
	patronStatus: string | null;
};

const debugUsers: DebugUser[] = [];

export const webhooksServer = new Hono<HonoServerGeneric>();

function debugJSON(value: unknown) {
	return JSON.stringify(
		value,
		(_, innerValue) => (typeof innerValue === 'bigint' ? innerValue.toString() : innerValue),
		2
	);
}

function generateRandomUserID() {
	const now = BigInt(Date.now());
	const random = BigInt(Math.floor(Math.random() * 1_000_000));
	return (now * 1000n + random).toString();
}

function barebonesUser(id: string, debugUsername?: string): DebugUser {
	return {
		id: BigInt(id),
		bits: [],
		github_id: null,
		patreon_id: null,
		cyr_patreon_id: null,
		migrated_user_id: null,
		leagues_completed_tasks_ids: [],
		leagues_points_balance_osb: 0,
		leagues_points_balance_bso: 0,
		leagues_points_total: 0,
		react_emoji_id: null,
		osb_total_level: null,
		bso_total_level: null,
		osb_total_xp: null,
		bso_total_xp: null,
		osb_cl_percent: null,
		bso_cl_percent: null,
		osb_mastery: null,
		bso_mastery: null,
		store_bitfield: [],
		testing_points: 0,
		testing_points_balance: 0,
		perk_tier: PerkTier.Zero,
		premium_balance_tier: null,
		premium_balance_expiry_date: null,
		last_patreon_gift: null,
		user_group_id: null,
		debugUsername
	};
}

async function getDebugUser(id: string, debugInfo: string[], username?: string): Promise<DebugUser> {
	const existing = debugUsers.find(user => user.id.toString() === id);
	if (existing) {
		if (username) existing.debugUsername = username;
		return existing;
	}

	debugInfo.push(`DB READ user.findUnique ${debugJSON({ where: { id } })}`);
	const stored = await roboChimpClient.user.findUnique({ where: { id: BigInt(id) } });
	if (stored) {
		debugInfo.push(`Found real user ${id}; using virtual copy only.`);
		const user = { ...stored, debugUsername: username };
		debugUsers.push(user);
		return user;
	}

	debugInfo.push(`No real user ${id}; creating local virtual user only.`);
	const user = barebonesUser(id, username ?? `debug-${id}`);
	debugUsers.push(user);
	return user;
}

async function usersInGroup(user: DebugUser, debugInfo: string[]) {
	if (!user.user_group_id) return [user];
	debugInfo.push(`DB READ user.findMany ${debugJSON({ where: { user_group_id: user.user_group_id } })}`);
	const storedGroup = await roboChimpClient.user.findMany({
		where: {
			user_group_id: user.user_group_id
		}
	});
	const localGroup = debugUsers.filter(groupUser => groupUser.user_group_id === user.user_group_id);
	const group = [
		...new Map([...storedGroup, ...localGroup].map(groupUser => [groupUser.id.toString(), groupUser])).values()
	];
	for (const groupUser of group) {
		if (!debugUsers.some(existing => existing.id === groupUser.id)) debugUsers.push(groupUser);
	}
	return group.length > 0 ? group : [user];
}

function getPaidBits(bits: number[]) {
	return bits.filter(bit => paidTiers.some(tier => tier.bit === bit));
}

function normalizeSourceBits({
	bits,
	paidBits,
	source,
	markHasEverBeenPatron
}: {
	bits: number[];
	paidBits: number[];
	source: PaidTierSource;
	markHasEverBeenPatron: boolean;
}) {
	const nextBits = bits.filter(bit => !paidTiers.some(tier => tier.source === source && tier.bit === bit));
	if (markHasEverBeenPatron && !nextBits.includes(Bits.HasEverBeenPatron)) nextBits.push(Bits.HasEverBeenPatron);
	nextBits.push(...paidBits);
	return uniqueArr(nextBits);
}

function perkTierFromPaidBits(bits: number[]) {
	return (
		paidTiers.filter(tier => bits.includes(tier.bit)).sort((a, b) => b.perkTier - a.perkTier)[0]?.perkTier ??
		PerkTier.Zero
	);
}

function parsePatreonDebugMember(rawBody: string, event: string, config: CampaignConfig): PatreonDebugMember {
	const payload = JSON.parse(rawBody);
	const member = payload.data;
	const patreonID = member?.relationships?.user?.data?.id;
	if (typeof patreonID !== 'string' || patreonID.length === 0) {
		throw new Error('Patreon webhook member did not contain a user relationship ID.');
	}

	const tierMap = new Map(config.tiers.filter(tier => tier.id).map(tier => [tier.id!, tier]));
	const entitledTier =
		Array.isArray(member.relationships?.currently_entitled_tiers?.data) && !event.endsWith(':delete')
			? (member.relationships.currently_entitled_tiers.data
					.map((tier: { id: string }) => tierMap.get(tier.id))
					.filter(Boolean)
					.sort((a: PatronTier, b: PatronTier) => b.perkTier - a.perkTier)[0] ?? null)
			: null;
	const userBlob = payload.included?.find((blob: any) => blob.type === 'user' && blob.id === patreonID);
	const discordID = userBlob?.attributes?.social_connections?.discord?.user_id;

	return {
		source: config.source,
		patreonID,
		discordID: typeof discordID === 'string' && discordID.length > 0 ? discordID : null,
		entitledTier,
		patronStatus: member.attributes?.patron_status ?? null
	};
}

async function resolvePatreonDebugUser(member: PatreonDebugMember, debugInfo: string[]) {
	if (member.discordID) {
		debugInfo.push(`Found Discord ID ${member.discordID} in webhook body.`);
		return getDebugUser(member.discordID, debugInfo);
	}

	const user = debugUsers.find(debugUser =>
		member.source === 'magna'
			? debugUser.patreon_id === member.patreonID
			: debugUser.cyr_patreon_id === member.patreonID
	);
	if (user) {
		debugInfo.push(`Found local virtual user ${user.id.toString()} by Patreon profile.`);
		return user;
	}

	debugInfo.push(`DB READ user.findFirst for Patreon profile ${member.patreonID}.`);
	const stored = await roboChimpClient.user.findFirst({
		where: member.source === 'magna' ? { patreon_id: member.patreonID } : { cyr_patreon_id: member.patreonID }
	});
	if (!stored) return null;
	debugInfo.push(`Found Discord ID ${stored.id.toString()} from linked Patreon profile.`);
	const virtualUser = { ...stored, debugUsername: `debug-patron-${member.patreonID}` };
	debugUsers.push(virtualUser);
	return virtualUser;
}

async function handlePatreonDebugWebhook(rawBody: string, event: PatreonWebhookEvent, config: CampaignConfig) {
	const debugInfo: string[] = [`DEBUG Patreon ${event} ${config.source}`];
	const member = parsePatreonDebugMember(rawBody, event, config);
	const user = await resolvePatreonDebugUser(member, debugInfo);
	const resolvedDiscordID = member.discordID ?? user?.id.toString() ?? null;
	if (!user) {
		debugInfo.push("Couldn't find a discord id for Patreon user, skipping");
		await createPatreonWebhookLog({
			rawBody,
			action: event,
			member,
			discordID: null,
			messages: debugInfo,
			isDebug: true
		});
		console.log(debugInfo.join('\n'));
		return debugInfo.join('\n');
	}
	const groupUsers = await usersInGroup(user, debugInfo);
	const paidBits = member.patronStatus === 'active_patron' && member.entitledTier ? [member.entitledTier.bit] : [];
	const idField = member.source === 'magna' ? 'patreon_id' : 'cyr_patreon_id';

	const rowsNext = groupUsers.map(groupUser => {
		const nextBits =
			groupUser.id === user.id
				? normalizeSourceBits({
						bits: groupUser.bits,
						paidBits,
						source: member.source,
						markHasEverBeenPatron: paidBits.length > 0 || groupUser.bits.includes(Bits.HasEverBeenPatron)
					})
				: groupUser.bits;
		return { groupUser, nextBits };
	});
	const groupTier = Math.max(...rowsNext.map(row => perkTierFromPaidBits(row.nextBits)), PerkTier.Zero);

	for (const row of rowsNext) {
		const data = {
			bits: row.nextBits,
			perk_tier: groupTier,
			...(row.groupUser.id === user.id ? { [idField]: member.patreonID } : {})
		};
		debugInfo.push(`DB SKIPPED user.update ${debugJSON({ where: { id: row.groupUser.id }, data })}`);
		row.groupUser.bits = row.nextBits;
		row.groupUser.perk_tier = groupTier;
		if (row.groupUser.id === user.id) {
			if (member.source === 'magna') row.groupUser.patreon_id = member.patreonID;
			else row.groupUser.cyr_patreon_id = member.patreonID;
		}
	}

	debugInfo.push(
		`DB SKIPPED onTierChange ${debugJSON({ newTier: groupTier, discordIDs: groupUsers.map(u => u.id) })}`
	);
	await createPatreonWebhookLog({
		rawBody,
		action: event,
		member,
		discordID: resolvedDiscordID,
		messages: debugInfo,
		isDebug: true
	});
	console.log(debugInfo.join('\n'));

	const tierText = member.entitledTier
		? `${member.source} tier ${member.entitledTier.number}`
		: `${member.source} no paid tier`;
	return `${user.id.toString()}: ${tierText}, perk_tier ${groupTier}`;
}

webhooksServer.post('/patreon', async c => {
	const signature = c.req.header('x-patreon-signature');
	if (!signature) return httpErr.BAD_REQUEST({ message: 'Missing header' });

	const raw = await c.req.text();
	if (!raw) return httpErr.BAD_REQUEST({ message: 'Missing body' });

	const campaign = getVerifiedPatreonCampaign(raw, signature);
	if (!campaign) return httpErr.BAD_REQUEST({ message: 'Unverified' });

	const patreonEvent = c.req.header('X-Patreon-Event');
	if (!isPatreonEvent(patreonEvent)) {
		const member = parsePatreonDebugMember(raw, patreonEvent ?? 'unknown', campaign);
		const messages = [
			`DEBUG Patreon ${patreonEvent ?? 'unknown'} ${campaign.source}`,
			`Ignoring Patreon webhook event ${patreonEvent ?? 'unknown'}.`
		];
		await createPatreonWebhookLog({
			rawBody: raw,
			action: patreonEvent ?? null,
			member,
			discordID: member.discordID,
			messages,
			isDebug: true
		});
		console.log(messages.join('\n'));
		return c.text('OK');
	}

	try {
		const result = await handlePatreonDebugWebhook(raw, patreonEvent, campaign);
		if (result) console.log(result.slice(0, 1950));
	} catch (err) {
		console.error(err);
		return httpErr.BAD_REQUEST({ message: 'Invalid Patreon webhook body' });
	}

	return c.text('OK');
});

webhooksServer.post('/github', async c => {
	const debugInfo: string[] = ['DEBUG GitHub sponsors webhook'];
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

	const githubID = Number(parsed.sender.id);
	debugInfo.push(`DB SKIPPED user.findFirst ${debugJSON({ where: { github_id: githubID } })}`);
	const user =
		debugUsers.find(debugUser => debugUser.github_id === githubID) ??
		(await getDebugUser(generateRandomUserID(), debugInfo, parsed.sender.login));
	user.github_id = githubID;

	const tier = ['created', 'tier_changed', 'pending_tier_change'].includes(parsed.action)
		? parseStrToTier(parsed.sponsorship.tier.name)
		: null;
	if (tier) {
		const paidTier = paidTiers.find(candidate => candidate.perkTier === tier && candidate.source === 'magna');
		if (paidTier) {
			const nextBits = normalizeSourceBits({
				bits: user.bits,
				paidBits: [paidTier.bit],
				source: 'magna',
				markHasEverBeenPatron: true
			});
			debugInfo.push(
				`DB SKIPPED user.update ${debugJSON({ where: { id: user.id }, data: { bits: nextBits, perk_tier: tier } })}`
			);
			user.bits = nextBits;
			user.perk_tier = tier;
		}
	} else if (parsed.action === 'cancelled') {
		const nextBits = user.bits.filter(bit => !getPaidBits([bit]).length);
		debugInfo.push(
			`DB SKIPPED user.update ${debugJSON({ where: { id: user.id }, data: { bits: nextBits, perk_tier: PerkTier.Zero } })}`
		);
		user.bits = nextBits;
		user.perk_tier = PerkTier.Zero;
	}

	console.log(debugInfo.join('\n'));
	return c.text('OK');
});

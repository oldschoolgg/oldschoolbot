import { createHmac } from 'node:crypto';
import { notEmpty, PerkTier, uniqueArr } from '@oldschoolgg/toolkit';
import { Prisma } from '@prisma/robochimp';

import type { RUser } from '@/structures/RUser.js';
import { globalConfig } from '../constants.js';
import { allPatronBits, Bits, cyrTiers, magnaTiers, type PaidTierSource, type PatronTier, paidTiers } from '../util.js';
import type { OSBPrismaClient } from './prisma.js';

const BadgesEnum = {
	Developer: 0,
	Booster: 1,
	LimitedPatron: 2,
	Patron: 3,
	Moderator: 4,
	GreenGem: 5,
	Bug: 6,
	GoldenTrophy: 7,
	TopSacrifice: 8,
	TopSkiller: 9,
	TopCollector: 10,
	TopMinigame: 11,
	SotWTrophy: 12,
	Slayer: 13,
	TopGiveawayer: 14,
	Farmer: 15,
	Hacktoberfest: 16
} as const;

type RobochimpUserState = {
	id: bigint;
	bits: number[];
	perk_tier: number;
	user_group_id: string | null;
	github_id: number | null;
	patreon_id: string | null;
};

type DesiredRobochimpUserState = RobochimpUserState & {
	nextBits: number[];
	nextPatreonID: string | null;
	nextPerkTier: number;
};

type EntitledTiersByUserID = Record<string, PatronTier[]>;

type PatreonUserToUpsert = {
	discordID: string;
	patreonID: string;
};

type PatreonMember = {
	source: PaidTierSource;
	patreonID: string;
	discordID?: string;
	entitledTier: PatronTier | null;
	patronStatus: string | null;
};

type Sponsor = {
	githubID: string;
	tier: PerkTier | null;
};

type CampaignConfig = {
	source: PaidTierSource;
	token: string;
	campaignID: string;
	webhookSecret?: string;
	tiers: PatronTier[];
};

function removePaidBits(bits: readonly number[]) {
	return bits.filter(bit => !paidTiers.some(tier => tier.bit === bit));
}

function normalizeBits({
	bits,
	paidBits,
	markHasEverBeenPatron
}: {
	bits: readonly number[];
	paidBits: readonly number[];
	markHasEverBeenPatron: boolean;
}) {
	const nextBits = [...removePaidBits(bits)];
	if (markHasEverBeenPatron && !nextBits.includes(Bits.HasEverBeenPatron)) {
		nextBits.push(Bits.HasEverBeenPatron);
	}
	nextBits.push(...paidBits);
	return uniqueArr(nextBits);
}

function getHighestTierFromBits(bits: readonly number[]) {
	return paidTiers.filter(tier => bits.includes(tier.bit)).sort((a, b) => b.perkTier - a.perkTier)[0] ?? null;
}

function getPaidBits(bits: readonly number[]) {
	return bits.filter(bit => allPatronBits.includes(bit));
}

function getPerkTierFromPaidBits(bits: readonly number[]) {
	const highestPaidTier = getHighestTierFromBits(getPaidBits(bits));
	return highestPaidTier?.perkTier ?? 0;
}

function sameNumberArray(a: readonly number[], b: readonly number[]) {
	return a.length === b.length && a.every((value, index) => value === b[index]);
}

function addEntitlement(entitlementsByUserID: EntitledTiersByUserID, userID: string, tier: PatronTier) {
	const existing = entitlementsByUserID[userID] ?? [];
	if (!existing.some(existingTier => existingTier.bit === tier.bit)) {
		existing.push(tier);
	}
	entitlementsByUserID[userID] = existing;
}

function intArraySql(values: readonly number[]) {
	return values.length === 0 ? Prisma.sql`ARRAY[]::integer[]` : Prisma.sql`ARRAY[${Prisma.join(values)}]::integer[]`;
}

function getCyrTierConfigs(): PatronTier[] {
	const tierIDMap = new Map<number, string | undefined>([
		[0, globalConfig.cyrPatreonTier0ID],
		[1, globalConfig.cyrPatreonTier1ID],
		[2, globalConfig.cyrPatreonTier2ID],
		[3, globalConfig.cyrPatreonTier3ID],
		[4, globalConfig.cyrPatreonTier4ID],
		[5, globalConfig.cyrPatreonTier5ID],
		[6, globalConfig.cyrPatreonTier6ID],
		[7, globalConfig.cyrPatreonTier7ID]
	]);

	return cyrTiers
		.map(tier => {
			const id = tierIDMap.get(tier.number);
			return id ? { ...tier, id } : null;
		})
		.filter(notEmpty);
}

function getPatreonCampaignConfigs(): CampaignConfig[] {
	const configs: CampaignConfig[] = [];

	if (globalConfig.magnaPatreonToken && globalConfig.magnaPatreonCampaignID) {
		configs.push({
			source: 'magna',
			token: globalConfig.magnaPatreonToken,
			campaignID: globalConfig.magnaPatreonCampaignID,
			webhookSecret: globalConfig.magnaPatreonWebhookSecret,
			tiers: magnaTiers
		});
	}
	if (globalConfig.cyrPatreonToken && globalConfig.cyrPatreonCampaignID) {
		configs.push({
			source: 'cyr',
			token: globalConfig.cyrPatreonToken,
			campaignID: globalConfig.cyrPatreonCampaignID,
			webhookSecret: globalConfig.cyrPatreonWebhookSecret,
			tiers: getCyrTierConfigs()
		});
	}

	return configs;
}

function buildPatreonApiURL(campaignID: string) {
	const url = new URL(`https://patreon.com/api/oauth2/v2/campaigns/${campaignID}/members`);
	url.search = new URLSearchParams([
		['include', ['user', 'currently_entitled_tiers'].join(',')],
		[
			'fields[member]',
			[
				'pledge_relationship_start',
				'last_charge_date',
				'last_charge_status',
				'lifetime_support_cents',
				'patron_status'
			].join(',')
		],
		['fields[user]', ['social_connections'].join(',')],
		['page[count]', '1000']
	]).toString();
	return url.toString();
}

async function fetchSponsors() {
	if (!globalConfig.githubToken) return [];

	const { graphql } = await import('@octokit/graphql');
	const graphqlWithAuth = graphql.defaults({
		headers: {
			authorization: `token ${globalConfig.githubToken}`
		}
	});

	const res: any = await graphqlWithAuth(
		`
		{
			viewer {
				sponsorshipsAsMaintainer(includePrivate: true, first: 100) {
					nodes {
						privacyLevel
						tier {
							name
						}
						sponsorEntity {
							... on User {
								databaseId
							}
						}
					}
				}
			}
		}
		`
	);

	return res.viewer.sponsorshipsAsMaintainer.nodes.map((node: any) => ({
		githubID: String(node.sponsorEntity.databaseId),
		tier: parseStrToTier(node.tier.name)
	})) as Sponsor[];
}

async function onTierChange({
	newTier,
	discordIDs
}: {
	newTier: number;
	oldTier: number;
	discordIDs: string[];
	isFirstTimePatron: boolean;
}) {
	for (const client of [osbClient, bsoClient] as OSBPrismaClient[]) {
		const users = await client.user.findMany({
			where: {
				id: {
					in: discordIDs
				}
			},
			select: {
				id: true,
				badges: true
			}
		});

		if (newTier === 0) {
			for (const user of users) {
				if (user.badges.includes(BadgesEnum.Patron) || user.badges.includes(BadgesEnum.LimitedPatron)) {
					await client.user.updateMany({
						where: {
							id: user.id
						},
						data: {
							badges: user.badges.filter(b => b !== BadgesEnum.Patron && b !== BadgesEnum.LimitedPatron)
						}
					});
				}
			}
		} else {
			const usersToGiveBadge = users.filter(
				u => !u.badges.includes(BadgesEnum.Patron) && !u.badges.includes(BadgesEnum.LimitedPatron)
			);
			await client.user.updateMany({
				where: {
					id: {
						in: usersToGiveBadge.map(u => u.id)
					}
				},
				data: {
					badges: {
						push: BadgesEnum.Patron
					}
				}
			});
		}
	}

	await Promise.all(discordIDs.map(u => globalClient.fetchRUser(u)));
}

export function parseStrToTier(str: string) {
	switch (str) {
		case '$3 a month':
			return PerkTier.Two;
		case '$6 a month':
			return PerkTier.Three;
		case '$14 a month':
			return PerkTier.Four;
		case '$23 a month':
			return PerkTier.Five;
		case '$46 a month':
			return PerkTier.Six;
		case '$99 a month':
			return PerkTier.Seven;
		default:
			return null;
	}
}

class PatreonTask {
	public enabled = globalConfig.isProduction;

	private async fetchUsersToReconcile(extraUserIDs: readonly string[] = []) {
		const extraIDs = extraUserIDs.map(id => BigInt(id));
		const users = await roboChimpClient.user.findMany({
			where: {
				OR: [
					{ bits: { hasSome: allPatronBits } },
					{ perk_tier: { gt: 0 } },
					...(extraIDs.length > 0 ? [{ id: { in: extraIDs } }] : [])
				]
			},
			select: {
				id: true,
				bits: true,
				perk_tier: true,
				user_group_id: true,
				github_id: true,
				patreon_id: true
			},
			orderBy: {
				id: 'asc'
			}
		});

		const groupIDs = uniqueArr(users.map(user => user.user_group_id).filter(notEmpty));
		if (groupIDs.length === 0) return users;

		const groupUsers = await roboChimpClient.user.findMany({
			where: {
				user_group_id: {
					in: groupIDs
				}
			},
			select: {
				id: true,
				bits: true,
				perk_tier: true,
				user_group_id: true,
				github_id: true,
				patreon_id: true
			},
			orderBy: {
				id: 'asc'
			}
		});

		return [...new Map([...users, ...groupUsers].map(user => [user.id.toString(), user])).values()];
	}

	private async fetchLinkedUsers() {
		return roboChimpClient.user.findMany({
			where: {
				OR: [{ patreon_id: { not: null } }, { github_id: { not: null } }]
			},
			select: {
				id: true,
				bits: true,
				perk_tier: true,
				user_group_id: true,
				github_id: true,
				patreon_id: true
			}
		});
	}

	private async fetchPatronsForCampaign(config: CampaignConfig, url?: string): Promise<PatreonMember[]> {
		const members: PatreonMember[] = [];
		const result: any = await fetch(url ?? buildPatreonApiURL(config.campaignID), {
			headers: { Authorization: `Bearer ${config.token}` }
		}).then(res => res.json());

		if (result.errors) {
			console.error(result.errors);
			throw new Error(`Failed to fetch ${config.source} patrons.`);
		}

		const tierMap = new Map(config.tiers.filter(tier => tier.id).map(tier => [tier.id!, tier]));
		for (const user of result.data) {
			const socialConnections = result.included.find((i: any) => i.id === user.relationships.user.data.id)
				?.attributes?.social_connections;
			const entitledTier =
				user.relationships.currently_entitled_tiers.data
					.map((i: any) => tierMap.get(i.id))
					.filter(notEmpty)
					.sort((a: PatronTier, b: PatronTier) => b.perkTier - a.perkTier)[0] ?? null;

			members.push({
				source: config.source,
				patreonID: user.relationships.user.data.id,
				discordID: socialConnections?.discord?.user_id,
				entitledTier,
				patronStatus: user.attributes.patron_status
			});
		}

		if (result.links?.next) {
			members.push(...(await this.fetchPatronsForCampaign(config, result.links.next)));
		}

		return members;
	}

	private async collectPaidEntitlements(
		users: RobochimpUserState[],
		messages: string[]
	): Promise<{
		entitlementsByUserID: EntitledTiersByUserID;
		patreonIDsByUserID: Record<string, string>;
		usersToUpsert: PatreonUserToUpsert[];
	}> {
		const entitlementsByUserID: EntitledTiersByUserID = {};
		const patreonIDsByUserID: Record<string, string> = {};
		const existingUserIDs = new Set(users.map(user => user.id.toString()));
		const usersByPatreonID = new Map(users.filter(user => user.patreon_id).map(user => [user.patreon_id!, user]));
		const usersByGithubID = new Map(
			users.filter(user => user.github_id !== null).map(user => [String(user.github_id), user])
		);
		const usersToUpsert = new Map<string, PatreonUserToUpsert>();

		for (const campaign of getPatreonCampaignConfigs()) {
			for (const member of await this.fetchPatronsForCampaign(campaign)) {
				if (member.patronStatus !== 'active_patron' || !member.entitledTier) {
					continue;
				}

				let discordID = member.discordID;
				if (!discordID) {
					discordID = usersByPatreonID.get(member.patreonID)?.id.toString();
				}
				if (!discordID) {
					messages.push(
						`Unable to resolve ${member.source} patron ${member.patreonID} to a Discord account.`
					);
					continue;
				}

				addEntitlement(entitlementsByUserID, discordID, member.entitledTier);
				patreonIDsByUserID[discordID] = member.patreonID;

				if (!existingUserIDs.has(discordID)) {
					usersToUpsert.set(discordID, { discordID, patreonID: member.patreonID });
				}
			}
		}

		for (const sponsor of await fetchSponsors()) {
			if (!sponsor.tier) continue;
			const user = usersByGithubID.get(sponsor.githubID);
			if (!user) continue;
			const tier = magnaTiers.find(candidate => candidate.perkTier === sponsor.tier);
			if (!tier) continue;
			addEntitlement(entitlementsByUserID, user.id.toString(), tier);
		}

		return { entitlementsByUserID, patreonIDsByUserID, usersToUpsert: [...usersToUpsert.values()] };
	}

	private async upsertPatreonUsers(usersToUpsert: readonly PatreonUserToUpsert[]) {
		if (usersToUpsert.length === 0) return;
		const values = Prisma.join(
			usersToUpsert.map(
				user => Prisma.sql`(
					${BigInt(user.discordID)}::bigint,
					ARRAY[${Bits.HasEverBeenPatron}]::integer[],
					${user.patreonID}::text,
					ARRAY[]::integer[],
					ARRAY[]::integer[]
				)`
			)
		);

		await roboChimpClient.$executeRaw`
			INSERT INTO public."user" AS existing (id, bits, patreon_id, store_bitfield, leagues_completed_tasks_ids)
			VALUES ${values}
			ON CONFLICT (id) DO UPDATE SET
				patreon_id = EXCLUDED.patreon_id,
				bits = CASE
					WHEN existing.bits @> ARRAY[${Bits.HasEverBeenPatron}]::integer[] THEN existing.bits
					ELSE existing.bits || ARRAY[${Bits.HasEverBeenPatron}]::integer[]
				END
		`;
	}

	private async updateUsersToMatchModel(users: readonly DesiredRobochimpUserState[]) {
		if (users.length === 0) return;
		const values = Prisma.join(
			users.map(
				user => Prisma.sql`(
					${user.id}::bigint,
					${intArraySql(user.nextBits)},
					${user.nextPerkTier}::integer,
					${user.nextPatreonID}::text
				)`
			)
		);

		await roboChimpClient.$executeRaw`
			UPDATE public."user" AS u
			SET
				bits = desired.bits,
				perk_tier = desired.perk_tier,
				patreon_id = desired.patreon_id
			FROM (VALUES ${values}) AS desired(id, bits, perk_tier, patreon_id)
			WHERE u.id = desired.id
		`;
	}

	async fetchPatrons() {
		return (
			await Promise.all(getPatreonCampaignConfigs().map(config => this.fetchPatronsForCampaign(config)))
		).flat();
	}

	async syncGithub() {
		return this.run();
	}

	async changeTier(user: RUser, shouldHave: PatronTier | PerkTier | number) {
		const tier =
			typeof shouldHave === 'number'
				? paidTiers.find(candidate => candidate.perkTier === shouldHave && candidate.source === 'magna')
				: shouldHave;
		if (!tier) {
			throw new Error(`Invalid tier: ${shouldHave}`);
		}

		const groupIDs = await user.findGroup();
		const groupedUsers = await roboChimpClient.user.findMany({
			where: {
				id: {
					in: groupIDs.map(id => BigInt(id))
				}
			},
			select: {
				id: true,
				bits: true,
				perk_tier: true
			},
			orderBy: {
				id: 'asc'
			}
		});

		const targetUserID = user.id;
		const desiredUsers = groupedUsers.map(groupedUser => ({
			...groupedUser,
			nextBits:
				groupedUser.id === targetUserID
					? normalizeBits({
							bits: groupedUser.bits,
							paidBits: [tier.bit],
							markHasEverBeenPatron: true
						})
					: groupedUser.bits
		}));
		const groupPerkTier = Math.max(
			...desiredUsers.map(groupedUser => getPerkTierFromPaidBits(groupedUser.nextBits)),
			0
		);

		await roboChimpClient.$transaction(
			desiredUsers.map(groupedUser =>
				roboChimpClient.user.update({
					where: { id: groupedUser.id },
					data: {
						bits: groupedUser.nextBits,
						perk_tier: groupPerkTier
					}
				})
			)
		);

		await onTierChange({
			newTier: groupPerkTier,
			oldTier: Math.max(...groupedUsers.map(groupedUser => groupedUser.perk_tier ?? 0), 0),
			discordIDs: groupIDs,
			isFirstTimePatron: groupedUsers.every(groupedUser => !groupedUser.bits.includes(Bits.HasEverBeenPatron))
		});
	}

	async removePerks(user: RUser, reason: string) {
		console.log(`Removing perks from ${user.id} because ${reason}`);
		const groupIDs = await user.findGroup();
		const groupedUsers = await roboChimpClient.user.findMany({
			where: {
				id: {
					in: groupIDs.map(id => BigInt(id))
				}
			},
			select: {
				id: true,
				bits: true,
				perk_tier: true
			}
		});

		const targetUserID = user.id;
		const desiredUsers = groupedUsers.map(groupedUser => ({
			...groupedUser,
			nextBits:
				groupedUser.id === targetUserID
					? normalizeBits({
							bits: groupedUser.bits,
							paidBits: [],
							markHasEverBeenPatron: groupedUser.bits.includes(Bits.HasEverBeenPatron)
						})
					: groupedUser.bits
		}));
		const groupPerkTier = Math.max(
			...desiredUsers.map(groupedUser => getPerkTierFromPaidBits(groupedUser.nextBits)),
			0
		);

		await roboChimpClient.$transaction(
			desiredUsers.map(groupedUser =>
				roboChimpClient.user.update({
					where: { id: groupedUser.id },
					data: {
						bits: groupedUser.nextBits,
						perk_tier: groupPerkTier
					}
				})
			)
		);

		await onTierChange({
			newTier: groupPerkTier,
			oldTier: Math.max(...groupedUsers.map(groupedUser => groupedUser.perk_tier ?? 0), 0),
			discordIDs: groupIDs,
			isFirstTimePatron: false
		});
	}

	async run() {
		if (!globalConfig.isProduction) {
			console.log('Skipping patreon task run because not production');
			return;
		}

		const messages: string[] = [];
		const usersToReconcile = await this.fetchUsersToReconcile();
		const linkedUsers = await this.fetchLinkedUsers();
		const lookupUsers = [
			...new Map([...usersToReconcile, ...linkedUsers].map(user => [user.id.toString(), user])).values()
		];
		const { entitlementsByUserID, patreonIDsByUserID, usersToUpsert } = await this.collectPaidEntitlements(
			lookupUsers,
			messages
		);

		await this.upsertPatreonUsers(usersToUpsert);

		const entitledDiscordIDs = uniqueArr([
			...Object.keys(entitlementsByUserID),
			...Object.keys(patreonIDsByUserID)
		]);
		const roboUsers = await this.fetchUsersToReconcile(entitledDiscordIDs);
		const desiredUsers = new Map<string, DesiredRobochimpUserState>();

		for (const user of roboUsers) {
			const discordID = user.id.toString();
			const entitlements = entitlementsByUserID[discordID] ?? [];
			const paidBits = uniqueArr(entitlements.map(entitlement => entitlement.bit));
			const nextBits = normalizeBits({
				bits: user.bits,
				paidBits,
				markHasEverBeenPatron: paidBits.length > 0 || user.bits.includes(Bits.HasEverBeenPatron)
			});
			const nextPerkTier = Math.max(...entitlements.map(tier => tier.perkTier), 0);

			desiredUsers.set(discordID, {
				...user,
				nextBits,
				nextPatreonID: patreonIDsByUserID[discordID] ?? user.patreon_id,
				nextPerkTier
			});
		}

		const usersByGroup = new Map<string, DesiredRobochimpUserState[]>();
		for (const user of desiredUsers.values()) {
			if (!user.user_group_id) continue;
			const groupUsers = usersByGroup.get(user.user_group_id) ?? [];
			groupUsers.push(user);
			usersByGroup.set(user.user_group_id, groupUsers);
		}

		for (const groupUsers of usersByGroup.values()) {
			const groupPerkTier = Math.max(...groupUsers.map(user => user.nextPerkTier), 0);
			for (const user of groupUsers) {
				user.nextPerkTier = groupPerkTier;
			}
		}

		const tierChanges: Array<{
			oldTier: number;
			newTier: number;
			discordIDs: string[];
			isFirstTimePatron: boolean;
		}> = [];

		for (const user of desiredUsers.values()) {
			if (user.user_group_id) continue;
			const oldTier = user.perk_tier ?? 0;
			if (oldTier === user.nextPerkTier) continue;
			tierChanges.push({
				oldTier,
				newTier: user.nextPerkTier,
				discordIDs: [user.id.toString()],
				isFirstTimePatron: !user.bits.includes(Bits.HasEverBeenPatron)
			});
		}

		for (const groupUsers of usersByGroup.values()) {
			const oldTier = Math.max(...groupUsers.map(user => user.perk_tier ?? 0), 0);
			const newTier = Math.max(...groupUsers.map(user => user.nextPerkTier), 0);
			if (oldTier === newTier) continue;
			tierChanges.push({
				oldTier,
				newTier,
				discordIDs: groupUsers.map(user => user.id.toString()),
				isFirstTimePatron: groupUsers.every(user => !user.bits.includes(Bits.HasEverBeenPatron))
			});
		}

		const usersToUpdate: DesiredRobochimpUserState[] = [];
		for (const user of desiredUsers.values()) {
			const discordID = user.id.toString();
			const paidBits = getPaidBits(user.nextBits);
			const highestPaidTier = getHighestTierFromBits(paidBits);
			const oldPerkTier = user.perk_tier ?? 0;

			if (
				!sameNumberArray(user.nextBits, user.bits) ||
				user.nextPerkTier !== oldPerkTier ||
				user.nextPatreonID !== user.patreon_id
			) {
				usersToUpdate.push(user);
			}

			if (paidBits.length > 0 || oldPerkTier !== user.nextPerkTier) {
				messages.push(
					`${discordID}: ${highestPaidTier ? `${highestPaidTier.source} tier ${highestPaidTier.number}` : 'no paid tier'}, perk_tier ${user.nextPerkTier}`
				);
			}
		}

		await this.updateUsersToMatchModel(usersToUpdate);

		for (const tierChange of tierChanges) {
			await onTierChange(tierChange);
		}
		await Promise.all(usersToUpdate.map(user => globalClient.fetchRUser(user.id)));

		return messages.filter(notEmpty);
	}
}

export const patreonTask = new PatreonTask();

export function verifyPatreonSecret(body: string, signature?: string | string[]): boolean {
	if (!signature) {
		return false;
	}

	for (const campaign of getPatreonCampaignConfigs()) {
		if (!campaign.webhookSecret) continue;
		const hmac = createHmac('md5', campaign.webhookSecret);
		hmac.update(body);
		if (signature === hmac.digest('hex')) {
			return true;
		}
	}

	return false;
}

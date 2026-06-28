import { createHmac } from 'node:crypto';
import { notEmpty, PerkTier, uniqueArr } from '@oldschoolgg/toolkit';

import type { RUser } from '@/structures/RUser.js';
import { globalConfig } from '../constants.js';
import { Bits, cyrTiers, magnaTiers, type PaidTierSource, type PatronTier, paidTiers } from '../util.js';
import type { OSBPrismaClient } from './prisma.js';

const ROOT_FREE_TIER_BITS = new Set([12, 24]);

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

type ExternalUserState = {
	id: string;
	bitfield: number[];
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

function getGroupKey(user: Pick<RobochimpUserState, 'id' | 'user_group_id'>) {
	return user.user_group_id ?? `solo:${user.id.toString()}`;
}

function getHighestTierFromBits(bits: readonly number[]) {
	return paidTiers.filter(tier => bits.includes(tier.bit)).sort((a, b) => b.perkTier - a.perkTier)[0] ?? null;
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
	const configs: CampaignConfig[] = [
		{
			source: 'magna',
			token: globalConfig.patreonToken,
			campaignID: globalConfig.patreonCampaignID,
			webhookSecret: globalConfig.patreonWebhookSecret,
			tiers: magnaTiers
		}
	];

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

function getFreePerkTier({
	groupUsers,
	osbUsersById,
	bsoUsersById
}: {
	groupUsers: RobochimpUserState[];
	osbUsersById: Map<string, ExternalUserState>;
	bsoUsersById: Map<string, ExternalUserState>;
}) {
	let freeTier = 0;

	if (
		groupUsers.some(user =>
			[Bits.Admin, Bits.Moderator, Bits.WikiContributor, Bits.Contributor].some(bit => user.bits.includes(bit))
		)
	) {
		freeTier = Math.max(freeTier, PerkTier.Four);
	} else if (groupUsers.some(user => user.bits.includes(Bits.Trusted))) {
		freeTier = Math.max(freeTier, PerkTier.Three);
	}

	if (
		groupUsers.some(user => {
			const id = user.id.toString();
			return [osbUsersById.get(id), bsoUsersById.get(id)]
				.filter(notEmpty)
				.some(externalUser => externalUser.bitfield.some(bit => ROOT_FREE_TIER_BITS.has(bit)));
		})
	) {
		freeTier = Math.max(freeTier, PerkTier.Two);
	}

	return freeTier;
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

	private async fetchRobochimpUsers() {
		return roboChimpClient.user.findMany({
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
	): Promise<{ entitlementsByUserID: Map<string, PatronTier[]>; patreonIDsByUserID: Map<string, string> }> {
		const entitlementsByUserID = new Map<string, PatronTier[]>();
		const patreonIDsByUserID = new Map<string, string>();
		const usersByPatreonID = new Map(users.filter(user => user.patreon_id).map(user => [user.patreon_id!, user]));
		const usersByGithubID = new Map(
			users.filter(user => user.github_id !== null).map(user => [String(user.github_id), user])
		);
		const ensuredUserIDs = new Set<string>();

		const addEntitlement = (userID: string, tier: PatronTier) => {
			const existing = entitlementsByUserID.get(userID) ?? [];
			if (!existing.some(existingTier => existingTier.bit === tier.bit)) {
				existing.push(tier);
			}
			entitlementsByUserID.set(userID, existing);
		};

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

				addEntitlement(discordID, member.entitledTier);
				patreonIDsByUserID.set(discordID, member.patreonID);

				if (!ensuredUserIDs.has(discordID)) {
					await roboChimpClient.user.upsert({
						where: { id: BigInt(discordID) },
						update: member.patreonID ? { patreon_id: member.patreonID } : {},
						create: {
							id: BigInt(discordID),
							patreon_id: member.patreonID
						}
					});
					ensuredUserIDs.add(discordID);
				}
			}
		}

		for (const sponsor of await fetchSponsors()) {
			if (!sponsor.tier) continue;
			const user = usersByGithubID.get(sponsor.githubID);
			if (!user) continue;
			const tier = magnaTiers.find(candidate => candidate.perkTier === sponsor.tier);
			if (!tier) continue;
			addEntitlement(user.id.toString(), tier);
		}

		return { entitlementsByUserID, patreonIDsByUserID };
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

		const mainUserID = groupedUsers[0]?.id;
		if (!mainUserID) return;

		await roboChimpClient.$transaction(
			groupedUsers.map(groupedUser =>
				roboChimpClient.user.update({
					where: { id: groupedUser.id },
					data: {
						bits: normalizeBits({
							bits: groupedUser.bits,
							paidBits: groupedUser.id === mainUserID ? [tier.bit] : [],
							markHasEverBeenPatron: true
						}),
						perk_tier: tier.perkTier
					}
				})
			)
		);

		await onTierChange({
			newTier: tier.perkTier,
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

		await roboChimpClient.$transaction(
			groupedUsers.map(groupedUser =>
				roboChimpClient.user.update({
					where: { id: groupedUser.id },
					data: {
						bits: normalizeBits({
							bits: groupedUser.bits,
							paidBits: [],
							markHasEverBeenPatron: groupedUser.bits.includes(Bits.HasEverBeenPatron)
						}),
						perk_tier: 0
					}
				})
			)
		);

		await onTierChange({
			newTier: 0,
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
		let roboUsers = await this.fetchRobochimpUsers();
		const { entitlementsByUserID, patreonIDsByUserID } = await this.collectPaidEntitlements(roboUsers, messages);
		roboUsers = await this.fetchRobochimpUsers();

		const discordIDs = roboUsers.map(user => user.id.toString());
		const [osbUsers, bsoUsers] = await Promise.all([
			osbClient.user.findMany({
				where: { id: { in: discordIDs } },
				select: { id: true, bitfield: true }
			}),
			bsoClient.user.findMany({
				where: { id: { in: discordIDs } },
				select: { id: true, bitfield: true }
			})
		]);

		const osbUsersById = new Map(osbUsers.map(user => [user.id, user]));
		const bsoUsersById = new Map(bsoUsers.map(user => [user.id, user]));
		const usersByGroup = new Map<string, RobochimpUserState[]>();

		for (const user of roboUsers) {
			const key = getGroupKey(user);
			const groupUsers = usersByGroup.get(key) ?? [];
			groupUsers.push(user);
			usersByGroup.set(key, groupUsers);
		}

		const updates = [];
		const tierChanges: Array<{
			oldTier: number;
			newTier: number;
			discordIDs: string[];
			isFirstTimePatron: boolean;
		}> = [];

		for (const [, groupUsers] of usersByGroup) {
			groupUsers.sort((a, b) => Number(a.id - b.id));
			const mainUser = groupUsers[0];
			const groupDiscordIDs = groupUsers.map(groupUser => groupUser.id.toString());
			const groupEntitlements = uniqueArr(
				groupDiscordIDs
					.flatMap(userID => entitlementsByUserID.get(userID) ?? [])
					.map(entitlement => entitlement.bit)
			)
				.map(bit => paidTiers.find(tier => tier.bit === bit))
				.filter(notEmpty);

			const targetPaidBits = groupEntitlements.map(tier => tier.bit);
			const targetPerkTier = Math.max(
				getFreePerkTier({ groupUsers, osbUsersById, bsoUsersById }),
				...groupEntitlements.map(tier => tier.perkTier),
				0
			);
			const oldPerkTier = Math.max(...groupUsers.map(groupUser => groupUser.perk_tier ?? 0), 0);
			const isFirstTimePatron = groupUsers.every(groupUser => !groupUser.bits.includes(Bits.HasEverBeenPatron));

			for (const groupUser of groupUsers) {
				const paidBits = groupUser.id === mainUser.id ? targetPaidBits : [];
				const nextBits = normalizeBits({
					bits: groupUser.bits,
					paidBits,
					markHasEverBeenPatron: targetPaidBits.length > 0 || groupUser.bits.includes(Bits.HasEverBeenPatron)
				});
				const nextPatreonID = patreonIDsByUserID.get(groupUser.id.toString()) ?? groupUser.patreon_id;

				if (
					nextBits.join(',') === groupUser.bits.join(',') &&
					targetPerkTier === (groupUser.perk_tier ?? 0) &&
					nextPatreonID === groupUser.patreon_id
				) {
					continue;
				}

				updates.push(
					roboChimpClient.user.update({
						where: { id: groupUser.id },
						data: {
							bits: nextBits,
							perk_tier: targetPerkTier,
							patreon_id: nextPatreonID
						}
					})
				);
			}

			if (oldPerkTier !== targetPerkTier) {
				tierChanges.push({
					oldTier: oldPerkTier,
					newTier: targetPerkTier,
					discordIDs: groupDiscordIDs,
					isFirstTimePatron
				});
			}

			if (targetPaidBits.length > 0 || oldPerkTier !== targetPerkTier) {
				const highestPaidTier = getHighestTierFromBits(targetPaidBits);
				messages.push(
					`${mainUser.id}: ${highestPaidTier ? `${highestPaidTier.source} tier ${highestPaidTier.number}` : 'no paid tier'}, perk_tier ${targetPerkTier}`
				);
			}
		}

		if (updates.length > 0) {
			await roboChimpClient.$transaction(updates);
		}

		for (const tierChange of tierChanges) {
			await onTierChange(tierChange);
		}

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

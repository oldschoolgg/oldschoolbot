import { createHmac } from 'node:crypto';
import { notEmpty, PerkTier, Time, uniqueArr } from '@oldschoolgg/toolkit';

import { globalConfig } from '../constants.js';
import { allPatronBits, Bits, type PatronTier, tiers } from '../util.js';
import type { OSBPrismaClient } from './prisma.js';

function updateBitfield({ bits, patronBit }: { bits: number[]; patronBit: number }) {
	const newBitfield = [...bits.filter(bit => !allPatronBits.includes(bit)), Bits.HasEverBeenPatron, patronBit];
	return uniqueArr(newBitfield);
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

interface Sponsor {
	githubID: string;
	githubName: string;
	tier: PerkTier;
	createdAt: Date;
	private: boolean;
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
            totalCount
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
            nodes {
              id
              privacyLevel
              createdAt
              tier {
                name
			  }
              sponsorEntity {
                ... on User {
                  databaseId
                  login
                }
              }
            }
          }
          id
        }
      }


      `
	);
	const data: Sponsor[] = res.viewer.sponsorshipsAsMaintainer.nodes
		.map((node: any) => ({
			githubID: node.sponsorEntity.databaseId,
			githubName: node.sponsorEntity.login as string,
			tier: parseStrToTier(node.tier.name),
			createdAt: new Date(node.createdAt),
			private: node.privacyLevel !== 'PUBLIC'
		}))
		.sort((a: any, b: any) => b.createdAt - a.createdAt);

	return data;
}

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
}

interface Patron {
	patreonID: string;
	discordID?: string;
	entitledTier: PatronTier;
	lastChargeDate: string;
	lastChargeStatus: string;
	lifeTimeSupportCents: number;
	patronStatus: string;
	pledgeRelationshipStart: string;
}

const patreonApiURL = new URL(`https://patreon.com/api/oauth2/v2/campaigns/${globalConfig.patreonCampaignID}/members`);

patreonApiURL.search = new URLSearchParams([
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

class PatreonTask {
	public enabled = globalConfig.isProduction;

	async validatePerks(userID: bigint, shouldHave: PatronTier): Promise<string | null> {
		const user = await globalClient.fetchRUser(userID);
		if (!user) return null;
		if (user.perkTierRaw !== shouldHave.perkTier) {
			await this.changeTier(user, shouldHave);
			return `Failed validation, wrong tier, changing to ${shouldHave} for ${userID}`;
		}
		return null;
	}

	async changeTier(user: RUser, shouldHave: PatronTier | PerkTier) {
		const tier = typeof shouldHave === 'number' ? tiers.find(t => t.perkTier === shouldHave) : shouldHave;
		if (!tier) {
			throw new Error(`Invalid tier: ${shouldHave}`);
		}
		const userGroup = await user.findGroup();

		const allUsers = await roboChimpClient.user.findMany({
			where: {
				id: {
					in: userGroup.map(id => BigInt(id))
				}
			}
		});

		await roboChimpClient.$transaction(
			allUsers.map(u =>
				roboChimpClient.user.update({
					where: {
						id: u.id
					},
					data: {
						bits: updateBitfield({ bits: u.bits, patronBit: tier.bit }),
						perk_tier: tier.perkTier
					},
					select: {
						bits: true
					}
				})
			)
		);

		await onTierChange({
			newTier: tier.perkTier,
			oldTier: user.perkTierRaw,
			discordIDs: userGroup,
			isFirstTimePatron: allUsers.every(u => !u.bits.includes(Bits.HasEverBeenPatron))
		});
	}

	async removePerks(user: RUser, _reason: string) {
		console.log(`Removing perks from ${user.id} because ${_reason}`);
		const userGroup = await user.findGroup();

		const allUsers = await roboChimpClient.user.findMany({
			where: {
				id: {
					in: userGroup.map(id => BigInt(id))
				}
			}
		});

		// Remove patron bits from all of the users
		await roboChimpClient.$transaction(
			allUsers.map(u =>
				roboChimpClient.user.update({
					where: {
						id: BigInt(u.id)
					},
					data: {
						bits: uniqueArr([
							...u.bits.filter(bit => !allPatronBits.includes(bit)),
							Bits.HasEverBeenPatron
						]),
						perk_tier: 0
					},
					select: {
						id: true
					}
				})
			)
		);

		await onTierChange({
			newTier: 0,
			oldTier: user.perkTierRaw,
			discordIDs: userGroup,
			isFirstTimePatron: false
		});
	}

	async syncGithub() {
		if (!globalConfig.isProduction) {
			console.log('Skipping patreon task run because not production');
			return;
		}
		const messages = [];
		const sponsors = await fetchSponsors();
		for (const sponsor of sponsors) {
			if (!sponsor.tier) continue;
			const userWithThisGithubID = await roboChimpClient.user.findFirst({
				select: { id: true },
				where: { github_id: Number(sponsor.githubID) }
			});
			if (!userWithThisGithubID) continue;
			const res = await this.validatePerks(
				userWithThisGithubID.id,
				tiers.find(t => t.perkTier === sponsor.tier)!
			);
			if (res) {
				messages.push(res);
			}
		}
		return messages;
	}

	async checkHasEverBeenPatron() {
		const patrons = await roboChimpClient.user.findMany({
			where: {
				OR: [
					{
						perk_tier: {
							gt: 0
						}
					},
					{
						github_id: {
							not: null
						}
					},
					{
						patreon_id: {
							not: null
						}
					}
				],
				NOT: [
					{
						bits: {
							has: Bits.HasEverBeenPatron
						}
					}
				]
			},
			select: {
				id: true
			}
		});
		await roboChimpClient.user.updateMany({
			where: {
				id: {
					in: patrons.map(p => p.id)
				}
			},
			data: {
				bits: {
					push: Bits.HasEverBeenPatron
				}
			}
		});
	}

	/**
	 * Give T3 to mods/contributors and their alts.
	 */
	async updateFreePerks() {
		const freeTierThree = await roboChimpClient.user.findMany({
			where: {
				OR: [Bits.Admin, Bits.Mod, Bits.WikiContributor, Bits.IsContributor].map(bit => ({
					bits: { has: bit }
				}))
			},
			select: {
				id: true,
				user_group_id: true
			}
		});

		const allUsers = await roboChimpClient.user.findMany({
			where: {
				OR: [
					...freeTierThree
						.map(u => u.user_group_id)
						.filter(notEmpty)
						.map(u => ({ user_group_id: u })),
					{
						id: {
							in: freeTierThree.map(u => u.id)
						}
					}
				]
			},
			select: {
				id: true
			}
		});

		return Promise.all(allUsers.map(u => this.validatePerks(u.id, tiers.find(t => t.number === 3)!)));
	}

	async run() {
		if (!globalConfig.isProduction) {
			console.log('Skipping patreon task run because not production');
			return;
		}
		// Reset all users' perk tier to 0 if their group has inconsistent perk tiers.
		await roboChimpClient.$queryRawUnsafe(`UPDATE "user"
SET perk_tier = 0
WHERE user_group_id IN (
SELECT u1.user_group_id
FROM "user" u1
JOIN "user" u2 ON u1.user_group_id = u2.user_group_id
WHERE u1.perk_tier <> u2.perk_tier
AND u1.id <> u2.id
);`);
		await this.checkHasEverBeenPatron();

		const fetchedPatrons = await this.fetchPatrons();
		const result = [];

		for (const patron of fetchedPatrons) {
			if (!patron.discordID) {
				const backupUser = await roboChimpClient.user.findFirst({
					where: {
						patreon_id: patron.patreonID
					}
				});
				if (backupUser) {
					result.push(
						`Found a backup user for ${patron.patreonID}, setting their discord ID to ${backupUser.id}`
					);
					patron.discordID = backupUser.id.toString();
				} else {
					continue;
				}
			}

			// See if any duplicates are newer than this one:
			const duplicateAccounts = fetchedPatrons.filter(
				p => p.discordID === patron.discordID && p.patreonID !== patron.patreonID
			);
			// We do this in 2 steps to avoid creating new Date objects for every patron entry; only when needed.
			const newerAccount = duplicateAccounts.find(
				p => new Date(p.lastChargeDate).getTime() > new Date(patron.lastChargeDate).getTime()
			);

			if (newerAccount) {
				continue;
			}

			const tierTheyShouldHave = patron.entitledTier;
			if (!tierTheyShouldHave) {
				continue;
			}

			// Only find the user if they don't already have the relevant perk tier.
			const user = await globalClient.fetchRUser(patron.discordID);
			if (!user) continue;

			const userIdentifier = `R[${user.id}]D[${patron.discordID}]P[${patron.patreonID}]`;

			if (user.patreonId !== patron.patreonID) {
				await roboChimpClient.user.update({
					where: {
						id: BigInt(patron.discordID)
					},
					data: {
						patreon_id: patron.patreonID
					}
				});
			}

			if ([Bits.Mod, Bits.Admin, Bits.WikiContributor].some(bit => user.bits.includes(bit))) {
				continue;
			}

			// If their last payment was more than a month ago, remove their status and continue.
			if (
				Date.now() - new Date(patron.lastChargeDate).getTime() > Time.Day * 33 &&
				patron.patronStatus !== 'active_patron'
			) {
				if (user.perkTierRaw < PerkTier.Two) continue;
				const str = `${userIdentifier} hasn't paid in over 1 month, so removing perks (T${user.perkTierRaw + 1}).`;
				await this.removePerks(user, str);
				continue;
			}

			// They already have the correct tier, so continue.
			if (user.bits.includes(tierTheyShouldHave.bit) && user.perkTierRaw === tierTheyShouldHave.perkTier) {
				continue;
			}

			result.push(`Giving ${userIdentifier} Tier ${tierTheyShouldHave.number}.`);
			await this.changeTier(user, tierTheyShouldHave);
		}

		result.push(await this.syncGithub());
		result.push(await this.updateFreePerks());
		return result.flat(5).filter(notEmpty);
	}

	async fetchPatrons(url?: string): Promise<Patron[]> {
		const users: Patron[] = [];
		const result: any = await fetch(url ?? patreonApiURL.toString(), {
			headers: { Authorization: `Bearer ${globalConfig.patreonToken}` }
		}).then(res => res.json());

		if (result.errors) {
			console.error(result.errors);
			throw 'Failed to fetch patrons.';
		}

		for (const user of result.data) {
			const socialConnections = result.included.find((i: any) => i.id === user.relationships.user.data.id)
				.attributes.social_connections;

			const entitledTier = user.relationships.currently_entitled_tiers.data
				.map((i: any) => i.id)
				.map((t: string) => tiers.find(a => a.id === t))
				.filter(notEmpty)[0];

			const patron: Patron = {
				patreonID: user.relationships.user.data.id,
				discordID: socialConnections?.discord?.user_id,
				entitledTier,
				lastChargeDate: user.attributes.last_charge_date,
				lastChargeStatus: user.attributes.last_charge_status,
				lifeTimeSupportCents: user.attributes.lifetime_support_cents,
				patronStatus: user.attributes.patron_status,
				pledgeRelationshipStart: user.attributes.pledge_relationship_start
			};

			users.push(patron);
		}

		// If theres another page, start recursively adding all the pages into the array.
		if (result.links?.next) {
			users.push(...(await this.fetchPatrons(result.links.next)));
		}

		return users;
	}
}

export const patreonTask = new PatreonTask();

export function verifyPatreonSecret(body: string, signature?: string | string[]): boolean {
	if (!signature) {
		return false;
	}
	const hmac = createHmac('md5', globalConfig.patreonWebhookSecret);
	hmac.update(body);
	const calculated = hmac.digest('hex');
	return signature === calculated;
}

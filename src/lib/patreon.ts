import { Time } from 'e';
import fetch from 'node-fetch';

import { production } from '../config';
import { cacheBadges } from './badges';
import { BadgesEnum, BitField, Channel, globalConfig, PatronTierID, PerkTier } from './constants';
import { fetchSponsors, getUserIdFromGithubID } from './http/util';
import backgroundImages from './minions/data/bankBackgrounds';
import { mahojiUserSettingsUpdate } from './MUser';
import { getUsersPerkTier } from './perkTiers';
import { roboChimpUserFetch } from './roboChimp';
import { prisma } from './settings/prisma';
import { Patron } from './types';
import { logError } from './util/logError';
import { sendToChannelID } from './util/webhook';

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

export const tiers: [PatronTierID, BitField][] = [
	[PatronTierID.Six, BitField.IsPatronTier6],
	[PatronTierID.Five, BitField.IsPatronTier5],
	[PatronTierID.Four, BitField.IsPatronTier4],
	[PatronTierID.Three, BitField.IsPatronTier3],
	[PatronTierID.Two, BitField.IsPatronTier2],
	[PatronTierID.One, BitField.IsPatronTier1]
];

function bitFieldFromPerkTier(tier: PerkTier): BitField {
	switch (tier) {
		case PerkTier.Two:
			return BitField.IsPatronTier1;
		case PerkTier.Three:
			return BitField.IsPatronTier2;
		case PerkTier.Four:
			return BitField.IsPatronTier3;
		case PerkTier.Five:
			return BitField.IsPatronTier4;
		case PerkTier.Six:
			return BitField.IsPatronTier5;
		case PerkTier.Seven:
			return BitField.IsPatronTier6;
		default: {
			throw new Error(`Unmatched bitFieldFromPerkTier ${tier}`);
		}
	}
}

function perkTierFromBitfield(bit: BitField): PerkTier {
	switch (bit) {
		case BitField.IsPatronTier1:
			return PerkTier.Two;
		case BitField.IsPatronTier2:
			return PerkTier.Three;
		case BitField.IsPatronTier3:
			return PerkTier.Four;
		case BitField.IsPatronTier4:
			return PerkTier.Five;
		case BitField.IsPatronTier5:
			return PerkTier.Six;
		case BitField.IsPatronTier6:
			return PerkTier.Seven;
		default: {
			throw new Error(`Unmatched perkTierFromBitfield ${bit}`);
		}
	}
}

class PatreonTask {
	public enabled = production;

	async validatePerks(userID: string, shouldHave: PerkTier): Promise<string | null> {
		const user = await prisma.user.findFirst({ where: { id: userID }, select: { bitfield: true } });
		if (!user) return null;
		let perkTier: PerkTier | 0 | null = getUsersPerkTier([...user.bitfield]);
		if (perkTier === 0 || perkTier === PerkTier.One) perkTier = null;

		if (!perkTier) {
			await this.givePerks(userID, shouldHave);
			return `Failed validation, giving ${shouldHave} to ${userID}`;
		}
		if (perkTier !== shouldHave) {
			await this.changeTier(userID, perkTier, shouldHave);
			return `Failed validation, wrong tier, changing to ${shouldHave} for ${userID}`;
		}
		return null;
	}

	async changeTier(userID: string, from: PerkTier, to: PerkTier) {
		const user = await prisma.user.findFirst({
			where: { id: userID },
			select: { bitfield: true, bankBackground: true }
		});
		if (!user) return null;

		const userBitfield = user.bitfield;

		const bitFieldToRemove = bitFieldFromPerkTier(from);
		const bitFieldToAdd = bitFieldFromPerkTier(to);
		const newBitfield = [...userBitfield.filter(i => i !== bitFieldToRemove), bitFieldToAdd];

		// Remove any/all the patron bits from this user.
		try {
			await mahojiUserSettingsUpdate(userID, {
				bitfield: newBitfield
			});
		} catch (_) {}
	}

	async givePerks(userID: string, perkTier: PerkTier) {
		const user = await prisma.user.findFirst({
			where: { id: userID },
			select: { bitfield: true, badges: true }
		});
		if (!user) return null;

		const userBadges = user.badges;

		// If they have neither the limited time badge or normal badge, give them the normal one.
		if (!userBadges.includes(BadgesEnum.Patron) && !userBadges.includes(BadgesEnum.LimitedPatron)) {
			try {
				await mahojiUserSettingsUpdate(userID, {
					badges: {
						push: BadgesEnum.Patron
					}
				});
			} catch (_) {}
		}

		const userBitfield = user.bitfield;

		try {
			let newField = [
				...userBitfield.filter(number => !tiers.map(t => t[1]).includes(number)),
				bitFieldFromPerkTier(perkTier)
			];

			await mahojiUserSettingsUpdate(userID, {
				bitfield: newField
			});
		} catch (_) {}
	}

	async removePerks(userID: string) {
		const user = await prisma.user.findFirst({
			where: { id: userID },
			select: { bitfield: true, badges: true, bank_bg_hex: true, bankBackground: true }
		});
		if (!user) return null;

		const userBitfield = user.bitfield;
		const userBadges = user.badges;

		// Remove any/all the patron bits from this user.

		await mahojiUserSettingsUpdate(userID, {
			bitfield: userBitfield.filter(number => !tiers.map(t => t[1]).includes(number))
		});

		// Remove patreon badge(s)
		const patronBadges: number[] = [BadgesEnum.Patron, BadgesEnum.LimitedPatron];
		await mahojiUserSettingsUpdate(userID, {
			badges: userBadges.filter(number => !patronBadges.includes(number))
		});

		// Remove patron bank background
		const bg = backgroundImages.find(bg => bg.id === user.bankBackground);
		if (bg?.perkTierNeeded) {
			await mahojiUserSettingsUpdate(userID, {
				bankBackground: 1
			});
		}
		if (user.bank_bg_hex !== null) {
			await mahojiUserSettingsUpdate(userID, {
				bank_bg_hex: null
			});
		}
	}

	async syncGithub() {
		let messages = [];
		const sponsors = await fetchSponsors();
		for (const sponsor of sponsors) {
			if (!sponsor.tier) continue;
			const userID = await getUserIdFromGithubID(sponsor.githubID);
			if (!userID) continue;
			let res = await this.validatePerks(userID, sponsor.tier);
			if (res) {
				messages.push(res);
			}
		}
		return messages;
	}

	async run() {
		debugLog('Starting patreon task...');
		const fetchedPatrons = await this.fetchPatrons();
		let result = [];

		for (const patron of fetchedPatrons) {
			if (!patron.discordID) {
				continue;
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
				result.push(
					`Discord[${patron.discordID}] Found Patron[${newerAccount.patreonID}] that's newer than the current Patron[${patron.patreonID}], so skipping.`
				);
				continue;
			}

			const user = await prisma.user.findFirst({ where: { id: patron.discordID }, select: { bitfield: true } });
			if (!user) continue;

			const roboChimpUser = await roboChimpUserFetch(patron.discordID);

			if (roboChimpUser.github_id) continue;

			const username = globalClient.users.cache.get(patron.discordID)?.username ?? '';
			const userIdentifier = `${username}(${patron.discordID}|${patron.patreonID})`;

			if (roboChimpUser.patreon_id !== patron.patreonID) {
				try {
					await roboChimpClient.user.update({
						where: {
							id: BigInt(patron.discordID)
						},
						data: {
							patreon_id: patron.patreonID
						}
					});
				} catch (err: any) {
					logError(
						new Error(
							`${err.message} Failed to set patreonID for Discord[${patron.discordID}] Patron[${patron.patreonID}]`
						),
						{
							id: patron.discordID,
							patreon_id: patron.patreonID
						}
					);
					continue;
				}
			}
			const userBitfield = user.bitfield;
			if (
				[BitField.isModerator, BitField.isContributor, BitField.IsWikiContributor].some(bit =>
					userBitfield.includes(bit)
				)
			) {
				continue;
			}

			// If their last payment was more than a month ago, remove their status and continue.
			if (
				Date.now() - new Date(patron.lastChargeDate).getTime() > Time.Day * 33 &&
				patron.patronStatus !== 'active_patron'
			) {
				const perkTier = getUsersPerkTier([...userBitfield]);
				if (perkTier < PerkTier.Two) continue;
				result.push(`${userIdentifier} hasn't paid in over 1 month, so removing perks (T${perkTier + 1}).`);
				this.removePerks(patron.discordID);
				continue;
			}

			for (let i = 0; i < tiers.length; i++) {
				const [tierID, bitField] = tiers[i];

				if (!patron.entitledTiers.includes(tierID)) continue;
				if (userBitfield.includes(bitField)) break;

				result.push(`${userIdentifier} was given Tier${i + 1}.`);
				await this.givePerks(patron.discordID, perkTierFromBitfield(bitField));
				break;
			}
		}

		const githubResult = await this.syncGithub();
		result.push('------------------ Github ------------------');
		result = result.concat(githubResult);

		if (production) {
			sendToChannelID(Channel.PatronLogs, {
				files: [{ attachment: Buffer.from(result.join('\n')), name: 'patron.txt' }]
			});
		} else {
			console.log(result.join('\n'));
		}

		cacheBadges();
		debugLog('Finished running patreon task...');
	}

	async fetchPatrons(url?: string): Promise<Patron[]> {
		const users: Patron[] = [];
		const result: any = await fetch(url ?? patreonApiURL.toString(), {
			headers: { Authorization: `Bearer ${globalConfig.patreonToken}` }
		}).then(res => res.json());

		if (result.errors) {
			logError(result.errors);
			throw 'Failed to fetch patrons.';
		}

		for (const user of result.data) {
			const socialConnections = result.included.find((i: any) => i.id === user.relationships.user.data.id)
				.attributes.social_connections;

			const patron: Patron = {
				patreonID: user.relationships.user.data.id,
				discordID: socialConnections?.discord?.user_id,
				entitledTiers: user.relationships.currently_entitled_tiers.data.map((i: any) => i.id),
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

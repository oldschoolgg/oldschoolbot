import { AttachmentBuilder, TextChannel } from 'discord.js';
import { Time } from 'e';
import fetch from 'node-fetch';

import { patreonConfig, production } from '../config';
import { mahojiUserSettingsUpdate } from '../mahoji/settingsUpdate';
import { cacheBadges } from './badges';
import { BadgesEnum, BitField, Channel, PatronTierID, PerkTier } from './constants';
import { fetchSponsors, getUserFromGithubID } from './http/util';
import backgroundImages from './minions/data/bankBackgrounds';
import { roboChimpUserFetch } from './roboChimp';
import { Patron } from './types';
import getUsersPerkTier from './util/getUsersPerkTier';
import { logError } from './util/logError';

const patreonApiURL = new URL(`https://patreon.com/api/oauth2/v2/campaigns/${patreonConfig?.campaignID}/members`);

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
		default: {
			throw new Error(`Unmatched perkTierFromBitfield ${bit}`);
		}
	}
}

class PatreonTask {
	public enabled = production;

	async validatePerks(userID: string, shouldHave: PerkTier): Promise<string | null> {
		const user = await mUserFetch(userID);
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
		const user = await mUserFetch(userID);

		const userBitfield = user.bitfield;

		const bitFieldToRemove = bitFieldFromPerkTier(from);
		const bitFieldToAdd = bitFieldFromPerkTier(to);
		const newBitfield = [...userBitfield.filter(i => i !== bitFieldToRemove), bitFieldToAdd];

		// Remove any/all the patron bits from this user.
		try {
			await user.update({
				bitfield: newBitfield
			});
		} catch (_) {}

		// Remove patron bank background
		const bg = backgroundImages.find(bg => bg.id === user.user.bankBackground);
		if (bg && bg.perkTierNeeded && bg.perkTierNeeded > to) {
			await user.update({
				bankBackground: 1
			});
		}
	}

	async givePerks(userID: string, perkTier: PerkTier) {
		const user = await mUserFetch(userID);

		const userBadges = user.user.badges;

		// If they have neither the limited time badge or normal badge, give them the normal one.
		if (!userBadges.includes(BadgesEnum.Patron) && !userBadges.includes(BadgesEnum.LimitedPatron)) {
			try {
				await user.update({
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

			await user.update({
				bitfield: newField
			});
		} catch (_) {}
	}

	async removePerks(userID: string) {
		const user = await mUserFetch(userID);

		const userBitfield = user.bitfield;
		const userBadges = user.user.badges;

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
		const bg = backgroundImages.find(bg => bg.id === user.user.bankBackground);
		if (bg?.perkTierNeeded) {
			await mahojiUserSettingsUpdate(userID, {
				bankBackground: 1
			});
		}
		if (user.user.bank_bg_hex !== null) {
			await mahojiUserSettingsUpdate(userID, {
				bank_bg_hex: null
			});
		}
	}

	async syncGithub() {
		let messages = [];
		const sponsors = await fetchSponsors();
		for (const sponsor of sponsors) {
			const user = await getUserFromGithubID(sponsor.githubID);
			if (!user) continue;
			let res = await this.validatePerks(user.id, sponsor.tier);
			if (res) {
				messages.push(res);
			}
		}
		return messages;
	}

	async run() {
		const fetchedPatrons = await this.fetchPatrons();
		const result = [];
		let messages = [];

		for (const patron of fetchedPatrons) {
			if (!patron.discordID) {
				result.push(`Patron[${patron.patreonID}] has no discord connected, so continuing.`);
				continue;
			}

			const duplicateAccount = fetchedPatrons.find(
				p => p.discordID === patron.discordID && p.patreonID !== patron.patreonID
			);
			if (duplicateAccount) {
				const thisDate = new Date(patron.lastChargeDate).getTime();
				const duplicateDate = new Date(duplicateAccount.lastChargeDate).getTime();
				// If the other account paid after this one did, we should skip this account.
				if (duplicateDate > thisDate) {
					messages.push(
						`Discord[${patron.discordID}] Patron[${patron.patreonID}] is a duplicate of Patron[${duplicateAccount.patreonID}], so continuing.`
					);
					continue;
				}
			}

			const user = await mUserFetch(patron.discordID);

			const roboChimpUser = await roboChimpUserFetch(BigInt(patron.discordID));

			if (roboChimpUser.github_id) continue;

			const username =
				globalClient.users.cache.get(patron.discordID)?.username ?? `${patron.discordID}|${patron.patreonID}`;

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
				result.push(`${username} hasn't paid in over 1 month, so removing perks.`);
				messages.push(`Removing T${perkTier} patron perks from ${username} PatreonID[${patron.patreonID}]`);
				this.removePerks(patron.discordID);
				continue;
			}

			for (let i = 0; i < tiers.length; i++) {
				const [tierID, bitField] = tiers[i];

				if (!patron.entitledTiers.includes(tierID)) continue;
				if (userBitfield.includes(bitField)) break;

				result.push(`${username} was given Tier ${i + 1}.`);
				messages.push(`Giving T${i + 1} patron perks to ${username} PatreonID[${patron.patreonID}]`);
				await this.givePerks(patron.discordID, perkTierFromBitfield(bitField));
				break;
			}
		}

		const githubResult = await this.syncGithub();
		messages = messages.concat(githubResult);

		const channel = globalClient.channels.cache.get(Channel.ErrorLogs) as TextChannel;
		if (production) {
			channel.send({ files: [new AttachmentBuilder(Buffer.from(result.join('\n')), { name: 'patreon.txt' })] });
			channel.send(messages.join(', '));
		} else {
			console.log(messages.join('\n'));
		}

		cacheBadges();
	}

	async fetchPatrons(url?: string): Promise<Patron[]> {
		const users: Patron[] = [];
		const result: any = await fetch(url ?? patreonApiURL.toString(), {
			headers: { Authorization: `Bearer ${patreonConfig!.token}` }
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

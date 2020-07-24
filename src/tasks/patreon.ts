import { ArrayActions, KlasaUser, Task } from 'klasa';
import fetch from 'node-fetch';
import { TextChannel } from 'discord.js';
import { O } from 'ts-toolbelt';

import { Patron } from '../lib/types';
import { BadgesEnum, BitField, Channel, PatronTierID, PerkTier, Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { patreonConfig } from '../config';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

const patreonApiURL = new URL(
	`https://patreon.com/api/oauth2/v2/campaigns/${patreonConfig?.campaignID}/members`
);

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
	['fields[user]', ['social_connections'].join(',')]
]).toString();

const tiers: [PatronTierID, BitField][] = [
	[PatronTierID.One, BitField.IsPatronTier1],
	[PatronTierID.Two, BitField.IsPatronTier2],
	[PatronTierID.Three, BitField.IsPatronTier3],
	[PatronTierID.Four, BitField.IsPatronTier4],
	[PatronTierID.Five, BitField.IsPatronTier5]
];

export default class extends Task {
	async init() {
		if (!patreonConfig) {
			this.disable();
		}
	}

	async removePerks(user: O.Readonly<KlasaUser>) {
		const userBitfield = user.settings.get(UserSettings.BitField);
		const userBadges = user.settings.get(UserSettings.Badges);

		// Remove any/all the patron bits from this user.
		await user.settings.update(
			UserSettings.BitField,
			userBitfield.filter(number => !tiers.map(t => t[1]).includes(number)),
			{
				arrayAction: ArrayActions.Overwrite
			}
		);

		// Remove patreon badge(s)
		await user.settings.update(
			UserSettings.Badges,
			userBadges.filter(
				number => ![BadgesEnum.Patron, BadgesEnum.LimitedPatron].includes(number)
			),
			{
				arrayAction: ArrayActions.Overwrite
			}
		);

		// Remove patron bank background
		if (user.settings.get(UserSettings.BankBackground) === 3) {
			await user.settings.update(UserSettings.BankBackground, 1);
		}
	}

	async run() {
		const fetchedPatrons = await this.fetchPatrons();
		const result = [];
		for (const patron of fetchedPatrons) {
			if (!patron.discordID) {
				result.push(`Patron[${patron.patreonID}] has no discord connected, so continuing.`);
				continue;
			}
			const user = await this.client.users.fetch(patron.discordID);

			const userBitfield = user.settings.get(UserSettings.BitField);
			const userBadges = user.settings.get(UserSettings.Badges);

			// If their last payment was more than a month ago, remove their status and continue.
			if (Date.now() - new Date(patron.lastChargeDate).getTime() > Time.Day * 33) {
				if (getUsersPerkTier(user) < PerkTier.Two) continue;
				result.push(
					`${user.username}[${patron.patreonID}] hasn't paid in over 1 month, so removing perks.`
				);
				this.removePerks(user);
				continue;
			}

			for (let i = 0; i < tiers.length; i++) {
				const [tierID, bitFieldId] = tiers[i];

				if (!patron.entitledTiers.includes(tierID)) continue;
				if (userBitfield.includes(bitFieldId)) continue;

				result.push(`${user.username}[${patron.patreonID}] was given Tier ${i + 1}.`);
				await user.settings.update(UserSettings.BitField, bitFieldId, {
					arrayAction: ArrayActions.Add
				});
				break;
			}

			// If they have neither the limited time badge or normal badge, give them the normal one.
			if (
				!userBadges.includes(BadgesEnum.Patron) &&
				!userBadges.includes(BadgesEnum.LimitedPatron)
			) {
				result.push(`${user.username}[${patron.patreonID}] was given Patron badge.`);
				await user.settings.update(UserSettings.Badges, BadgesEnum.Patron, {
					arrayAction: ArrayActions.Add
				});
			}
		}

		(this.client.channels.get(Channel.ErrorLogs) as TextChannel).sendFile(
			Buffer.from(result.join('\n')),
			'patreon.txt'
		);

		this.client.tasks.get('badges')?.run();
	}

	async fetchPatrons(url?: string): Promise<Patron[]> {
		const users: Patron[] = [];
		const result: any = await fetch(url || patreonApiURL, {
			headers: { Authorization: `Bearer ${patreonConfig!.token}` }
		}).then(res => res.json());

		if (result.errors) {
			console.error(result.errors);
			throw `Failed to fetch patrons.`;
		}

		for (const user of result.data) {
			const socialConnections = result.included.find(
				(i: any) => i.id === user.relationships.user.data.id
			).attributes.social_connections;

			const patron: Patron = {
				patreonID: user.relationships.user.data.id,
				discordID: socialConnections?.discord?.user_id,
				entitledTiers: user.relationships.currently_entitled_tiers.data.map(
					(i: any) => i.id
				),
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

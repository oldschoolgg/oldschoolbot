import { Task, ArrayActions } from 'klasa';
import fetch from 'node-fetch';
import { TextChannel } from 'discord.js';

import { privateConfig } from '../config';
import { Patron } from '../lib/types';
import { PatronTierID, BitField, Time, Roles, BadgesEnum, Channel } from '../lib/constants';
import { UserSettings } from '../lib/UserSettings';
import getSupportGuild from '../lib/util/getSupportGuild';
import { noOp } from '../lib/util';

const patreonApiURL = new URL(
	`https://patreon.com/api/oauth2/v2/campaigns/${privateConfig?.patreon.campaignID}/members`
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

const requestOptions = {
	headers: { Authorization: `Bearer ${privateConfig?.patreon.token}` }
};

export default class extends Task {
	async init() {
		if (!privateConfig?.patreon) {
			this.disable();
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
			const supportGuild = getSupportGuild(user.client);
			const member = await supportGuild.members.fetch(user.id).catch(noOp);

			const userBitfield = user.settings.get(UserSettings.BitField);
			const userBadges = user.settings.get(UserSettings.Badges);

			// If their last payment was more than a month ago, remove their status and continue.
			if (Date.now() - new Date(patron.lastChargeDate).getTime() > Time.Month) {
				result.push(
					`${user}[${patron.patreonID}] hasn't paid in over 1 month, so removing perks.`
				);

				// Remove any/all the patron bits from this user.
				await user.settings.update(
					UserSettings.BitField,
					userBitfield.filter(
						number =>
							![
								BitField.IsPatronTier1,
								BitField.IsPatronTier2,
								BitField.IsPatronTier3
							].includes(number)
					),
					{
						arrayAction: ArrayActions.Overwrite
					}
				);

				// Remove patreon role, if they have it
				if (member && member.roles.has(Roles.Patron)) {
					result.push(`${user}[${patron.patreonID}] had Patron role removed.`);
					await member.roles.remove(Roles.Patron).catch(noOp);
				}

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

				continue;
			}

			if (
				patron.entitledTiers.includes(PatronTierID.One) &&
				!userBitfield.includes(BitField.IsPatronTier1)
			) {
				result.push(`${user}[${patron.patreonID}] was given Tier 1.`);
				// If they are tier X on patreon, and they arent marked as tier X patreon in discord,
				// give them it.
				await user.settings.update(UserSettings.BitField, BitField.IsPatronTier1, {
					arrayAction: ArrayActions.Add
				});
			}

			if (
				patron.entitledTiers.includes(PatronTierID.Two) &&
				!userBitfield.includes(BitField.IsPatronTier2)
			) {
				result.push(`${user}[${patron.patreonID}] was given Tier 2.`);
				await user.settings.update(UserSettings.BitField, BitField.IsPatronTier2, {
					arrayAction: ArrayActions.Add
				});
			}

			if (
				patron.entitledTiers.includes(PatronTierID.Three) &&
				!userBitfield.includes(BitField.IsPatronTier3)
			) {
				result.push(`${user}[${patron.patreonID}] was given Tier 3.`);
				await user.settings.update(UserSettings.BitField, BitField.IsPatronTier3, {
					arrayAction: ArrayActions.Add
				});
			}

			// If they have neither the limited time badge or normal badge, give them the normal one.
			if (
				!userBadges.includes(BadgesEnum.Patron) &&
				!userBadges.includes(BadgesEnum.LimitedPatron)
			) {
				result.push(`${user}[${patron.patreonID}] was given Patron badge.`);
				await user.settings.update(UserSettings.Badges, BadgesEnum.Patron, {
					arrayAction: ArrayActions.Add
				});
			}

			// Add patreon role, if they don't have it
			if (member && !member.roles.has(Roles.Patron)) {
				result.push(`${user}[${patron.patreonID}] was given Patron role.`);
				await member.roles.add(Roles.Patron).catch(noOp);
			}
		}

		(this.client.channels.get(Channel.ErrorLogs) as TextChannel).send(result.join('\n'));

		this.client.tasks.get('badges')?.run();
	}

	async fetchPatrons(url?: string): Promise<Patron[]> {
		const users: Patron[] = [];
		const result: any = await fetch(url || patreonApiURL, requestOptions).then(res =>
			res.json()
		);

		if (result.errors) {
			console.error(result.errors);
			throw `Failed to fetch patrons.`;
		}

		for (const user of result.data) {
			const { discord } = result.included.find(
				(i: any) => i.id === user.relationships.user.data.id
			).attributes.social_connections;

			const patron: Patron = {
				patreonID: user.relationships.user.data.id,
				discordID: discord?.user_id,
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

import { percentChance } from 'e';
import { Task } from 'klasa';
import { Misc } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { maxOtherStats } from '../../../lib/gear/data/maxGearStats';
import { GearSetupTypes } from '../../../lib/gear/types';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../../lib/minions/functions/isImportantItemForMonster';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ItemBank } from '../../../lib/types';
import { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, calcWhatPercent, noOp, queuedMessageSend } from '../../../lib/util';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { randomVariation } from '../../../lib/util/randomVariation';
import { NightmareMonster } from './../../../lib/minions/data/killableMonsters/index';

const NIGHTMARES_HP = 2400;
const ZAM_HASTA_CRUSH = 65;

interface NightmareUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

const RawNightmare = Misc.Nightmare;

export default class extends Task {
	async run({ channelID, leader, users, quantity }: NightmareActivityTaskOptions) {
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NightmareUser[] = [];

		let debug = '';
		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.users.fetch(id).catch(noOp);
			if (!user) continue;
			const kc = user.settings.get(UserSettings.MonsterScores)[NightmareMonster.id] ?? 1;
			const weapon = user.equippedWeapon(GearSetupTypes.Melee);
			const gearStats = user.setupStats(GearSetupTypes.Melee);
			const percentMeleeStrength = calcWhatPercent(
				gearStats.melee_strength,
				maxOtherStats.melee_strength
			);
			const attackCrushStat = weapon?.equipment?.attack_crush ?? 0;
			const percentWeaponAttackCrush = calcWhatPercent(attackCrushStat, 95);
			const totalGearPercent = (percentMeleeStrength + percentWeaponAttackCrush) / 2;

			let percentChanceOfDeath = Math.floor(
				100 - (Math.log(kc) / Math.log(Math.sqrt(15))) * 50
			);

			// If they have 50% best gear, -25% chance of death.
			percentChanceOfDeath = Math.floor(percentChanceOfDeath - totalGearPercent / 2);

			// Chance of death cannot be over 90% or <2%.
			percentChanceOfDeath = Math.max(Math.min(percentChanceOfDeath, 90), 2);

			// Damage done starts off as being HP divided by user size.
			let damageDone = NIGHTMARES_HP / users.length;

			// Half it, to use a low damage amount as the base.
			damageDone /= 2;

			// If they have the BIS weapon, their damage is doubled.
			// e.g. 75% of of the best = 1.5x damage done.
			damageDone *= percentWeaponAttackCrush / 50;

			// Heavily punish them for having a weaker crush weapon than a zammy hasta.
			if (attackCrushStat < ZAM_HASTA_CRUSH) {
				damageDone /= 1.5;
			}

			debug += `\n${user.username}: DamageDone[${Math.floor(
				damageDone
			)}HP] DeathChance[${Math.floor(percentChanceOfDeath)}%] WeaponStrength[${Math.floor(
				percentWeaponAttackCrush
			)}%] GearStrength[${Math.floor(
				percentMeleeStrength
			)}%] TotalGear[${totalGearPercent}%]\n`;

			parsedUsers.push({
				id: user.id,
				chanceOfDeath: percentChanceOfDeath,
				damageDone
			});
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			// TODO: add random variation to dmg done?
			const loot = RawNightmare.kill({
				team: parsedUsers.map(user => ({
					id: user.id,
					damageDone: randomVariation(user.damageDone, 5)
				}))
			});

			// Give every team member a +1 to their KC.
			for (const user of parsedUsers) {
				kcAmounts[user.id] = Boolean(kcAmounts[user.id]) ? ++kcAmounts[user.id] : 1;
			}

			for (const user of parsedUsers) {
				if (percentChance(user.chanceOfDeath)) {
					deaths[user.id] = deaths[user.id] ? ++deaths[user.id] : 1;
					kcAmounts[user.id]--;
				} else {
					teamsLoot[user.id] = addBanks([teamsLoot[user.id] ?? {}, loot[user.id]]);
				}
			}
		}

		const leaderUser = await this.client.users.fetch(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${NightmareMonster.name}!\n\n`;

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;

			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(NightmareMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), NightmareMonster)
			);

			resultStr += `${
				purple ? Emoji.Purple : ''
			} **${user} received:** ||${await createReadableItemListFromBank(
				this.client,
				loot
			)}||\n`;

			announceLoot(this.client, leaderUser, NightmareMonster, quantity, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		resultStr += debug;

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await this.client.users.fetch(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user.username}**: ${qty}x`);
			}
			resultStr += `\n**Deaths: ${deaths.join(', ')}.`;
		}

		if (users.length > 1) {
			queuedMessageSend(this.client, channelID, resultStr);
		} else {
			const channel = this.client.channels.get(channelID);
			if (!channelIsSendable(channel)) return;
			channel.sendBankImage({
				bank: teamsLoot[leader],
				content: `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
					NightmareMonster.name
				}. Your Nightmare KC is now ${(leaderUser.settings.get(UserSettings.MonsterScores)[
					NightmareMonster.id
				] ?? 0) + quantity}.`,
				title: `${quantity}x Nightmare`,
				background: leaderUser.settings.get(UserSettings.BankBackground),
				user: leaderUser,
				flags: { showNewCL: 1 }
			});
		}
	}
}

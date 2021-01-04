import { percentChance } from 'e';
import { Task } from 'klasa';
import { Misc } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../../lib/minions/functions/isImportantItemForMonster';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ItemBank } from '../../../lib/types';
import { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, noOp, queuedMessageSend } from '../../../lib/util';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { getNightmareGearStats } from '../../../lib/util/getNightmareGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { randomVariation } from '../../../lib/util/randomVariation';
import { NightmareMonster } from './../../../lib/minions/data/killableMonsters/index';

interface NightmareUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

const RawNightmare = Misc.Nightmare;

export default class extends Task {
	async run(data: NightmareActivityTaskOptions) {
		let { channelID, leader, users, quantity, duration } = data;
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NightmareUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.users.fetch(id).catch(noOp);
			if (!user) continue;
			user.incrementMinionDailyDuration(duration);
			const [data] = getNightmareGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id });
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const loot = RawNightmare.kill({
				team: parsedUsers.map(user => ({
					id: user.id,
					damageDone: users.length === 1 ? 2400 : randomVariation(user.damageDone, 5)
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

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await this.client.users.fetch(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user.username}**: ${qty}x`);
			}
			resultStr += `\n**Deaths**: ${deaths.join(', ')}.`;
		}

		if (users.length > 1) {
			queuedMessageSend(this.client, channelID, resultStr);
		} else {
			const channel = this.client.channels.get(channelID);
			if (!channelIsSendable(channel)) return;

			let returnStr = '';
			let image = undefined;

			if (!kcAmounts[leader]) {
				returnStr = `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill the Nightmare, they apologize and promise to try harder next time.`;
			} else {
				returnStr = `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
					NightmareMonster.name
				}, you died ${deaths[leader] ?? 0} times. Your Nightmare KC is now ${
					(leaderUser.settings.get(UserSettings.MonsterScores)[NightmareMonster.id] ??
						0) + quantity
				}.`;

				image = await this.client.tasks
					.get('bankImage')!
					.generateBankImage(
						teamsLoot[leader],
						`${quantity}x Nightmare`,
						true,
						{ showNewCL: 1 },
						leaderUser
					);
			}

			handleTripFinish(
				this.client,
				leaderUser,
				channelID,
				returnStr,
				res => {
					leaderUser.log(`continued trip of ${quantity}x ${NightmareMonster.name}`);
					return this.client.commands.get('nightmare')!.run(res, ['solo']);
				},
				data,
				kcAmounts[leader] ? image : undefined,
				kcAmounts[leader] ? teamsLoot[leader] : undefined
			);
		}
	}
}

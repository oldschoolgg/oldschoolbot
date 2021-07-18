import { percentChance } from 'e';
import { Task } from 'klasa';
import { Bank, Misc } from 'oldschooljs';

import { Emoji, NIGHTMARE_ID } from '../../../lib/constants';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../../lib/minions/functions/isImportantItemForMonster';
import { ItemBank } from '../../../lib/types';
import { NightmareActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, noOp, randomVariation } from '../../../lib/util';
import { getNightmareGearStats } from '../../../lib/util/getNightmareGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';
import { NightmareMonster } from './../../../lib/minions/data/killableMonsters/index';

interface NightmareUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

const RawNightmare = Misc.Nightmare;

export default class extends Task {
	async run(data: NightmareActivityTaskOptions) {
		const { channelID, leader, users, quantity, duration } = data;
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NightmareUser[] = [];
		const totalLoot = new Bank();

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.users.fetch(id).catch(noOp);
			if (!user) continue;
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
			await addMonsterXP(user, {
				monsterID: NIGHTMARE_ID,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			totalLoot.add(loot);
			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(NightmareMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), NightmareMonster)
			);

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${new Bank(loot)}||\n`;

			announceLoot(this.client, leaderUser, NightmareMonster, loot, {
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
			sendToChannelID(this.client, channelID, { content: resultStr });
		} else if (!kcAmounts[leader]) {
			sendToChannelID(this.client, channelID, {
				content: `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill the Nightmare, they apologize and promise to try harder next time.`
			});
		} else {
			const { image } = await this.client.tasks
				.get('bankImage')!
				.generateBankImage(teamsLoot[leader], `${quantity}x Nightmare`, true, { showNewCL: 1 }, leaderUser);

			const kc = leaderUser.getKC(NightmareMonster.id);
			handleTripFinish(
				this.client,
				leaderUser,
				channelID,
				`${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
					NightmareMonster.name
				}, you died ${deaths[leader] ?? 0} times. Your Nightmare KC is now ${kc}.`,
				res => {
					leaderUser.log(`continued trip of ${quantity}x Nightmare`);
					return this.client.commands.get('nightmare')!.run(res, ['solo']);
				},
				image!,
				data,
				totalLoot.bank
			);
		}
	}
}

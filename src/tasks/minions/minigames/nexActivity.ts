import { calcWhatPercent, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { production } from '../../../config';
import { Emoji } from '../../../lib/constants';
import { nexCL, nexUniqueDrops } from '../../../lib/data/CollectionsExport';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { NexMonster } from '../../../lib/nex';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ItemBank } from '../../../lib/types';
import { BossActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, noOp, randomItemFromArray, roll, updateBankSetting } from '../../../lib/util';
import { getNexGearStats } from '../../../lib/util/getNexGearStats';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { sendToChannelID } from '../../../lib/util/webhook';

interface NexUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

export default class extends Task {
	async run(data: BossActivityTaskOptions) {
		const { channelID, userID, users, quantity, duration } = data;
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NexUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.fetchUser(id).catch(noOp);
			if (!user) continue;
			const [data] = getNexGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id });
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const teamTable = new SimpleTable<string>();

			// Track deaths per kill so you don't stay dead the entire trip.
			const deathsThisKill: Record<string, number> = {};

			let teamFailed = false;
			for (const user of parsedUsers.sort((a, b) => b.chanceOfDeath - a.chanceOfDeath)) {
				const currentDeaths = Object.keys(deathsThisKill).length;
				if (calcWhatPercent(currentDeaths, users.length) >= 50) {
					// If over 50% of the team died, the entire team dies.
					teamFailed = true;
				}

				if (teamFailed || percentChance(user.chanceOfDeath)) {
					deaths[user.id] = Boolean(deaths[user.id]) ? deaths[user.id] + 1 : 1;
					// Mark user as dead this kill:
					deathsThisKill[user.id] = 1;
				} else {
					// weight on damagedone
					teamTable.add(user.id, user.damageDone);
				}
			}

			const loot = new Bank();
			loot.add(NexMonster.table.kill(1, {}));
			if (roll(80 + users.length * 2)) {
				loot.add(randomItemFromArray(nexUniqueDrops), 1);
			}
			if (isDoubleLootActive(this.client)) {
				loot.multiply(2);
			}
			const winner = teamTable.roll()?.item;
			if (!winner) continue;
			const currentLoot = teamsLoot[winner];
			if (!currentLoot) teamsLoot[winner] = loot.bank;
			else teamsLoot[winner] = addBanks([currentLoot, loot.bank]);

			kcAmounts[winner] = Boolean(kcAmounts[winner]) ? ++kcAmounts[winner] : 1;
		}

		const leaderUser = await this.client.fetchUser(userID);
		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${NexMonster.name}!\n\n`;
		const totalLoot = new Bank();

		let soloXP = '';
		let soloPrevCl: ItemBank = {};
		let soloItemsAdded: ItemBank = {};

		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.fetchUser(userID).catch(noOp);
			if (!user) continue;
			let xpStr = '';
			if (kcAmounts[user.id]) {
				xpStr = await addMonsterXP(user, {
					monsterID: 46_274,
					quantity: Math.ceil(quantity / users.length),
					duration,
					isOnTask: false,
					taskQuantity: null
				});
			}
			totalLoot.add(loot);
			const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

			if (user.id === userID) {
				soloXP = xpStr;
				soloPrevCl = previousCL;
				soloItemsAdded = itemsAdded;
			}

			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(NexMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(id => nexCL.includes(parseInt(id)));

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${new Bank(loot)}||\n`;

			announceLoot({
				user: leaderUser,
				monsterID: NexMonster.id,
				loot: new Bank(loot),
				notifyDrops: NexMonster.notifyDrops,
				team: {
					leader: leaderUser,
					lootRecipient: user,
					size: users.length
				}
			});
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.NexLoot, totalLoot);

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await this.client.fetchUser(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user.username}**: ${qty}x`);
			}
			resultStr += `\n**Deaths**: ${deaths.join(', ')}.`;
		}

		let debug = production ? '' : `\`\`\`\n${JSON.stringify([parsedUsers, deaths], null, 4)}\n\`\`\``;

		if (users.length > 1) {
			if (Object.values(kcAmounts).length === 0) {
				sendToChannelID(this.client, channelID, {
					content: `${users
						.map(id => `<@${id}>`)
						.join(' ')} Your team all died, and failed to defeat Nex. ${debug}`
				});
			} else {
				sendToChannelID(this.client, channelID, { content: resultStr + debug });
			}
		} else {
			const image = !kcAmounts[userID]
				? undefined
				: (
						await this.client.tasks
							.get('bankImage')!
							.generateBankImage(
								soloItemsAdded,
								`Loot From ${quantity} ${NexMonster.name}:`,
								true,
								{ showNewCL: 1 },
								leaderUser,
								soloPrevCl
							)
				  ).image;
			handleTripFinish(
				this.client,
				leaderUser,
				channelID,
				!kcAmounts[userID]
					? `${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill Nex, they apologize and promise to try harder next time.`
					: `${leaderUser}, ${leaderUser.minionName} finished killing ${quantity} ${
							NexMonster.name
					  }, you died ${deaths[userID] ?? 0} times. Your Nex KC is now ${
							leaderUser.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0
					  }.\n\n${soloXP}`,
				res => {
					leaderUser.log('continued nex');
					return this.client.commands.get('nex')!.run(res, ['solo']);
				},
				image!,
				data,
				soloItemsAdded
			);
		}
	}
}

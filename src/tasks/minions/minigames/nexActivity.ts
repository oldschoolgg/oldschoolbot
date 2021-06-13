import { calcWhatPercent, percentChance } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { production } from '../../../config';
import { Emoji } from '../../../lib/constants';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { allNexItems, NexMonster } from '../../../lib/nex';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ItemBank } from '../../../lib/types';
import { BossActivityTaskOptions } from '../../../lib/types/minions';
import {
	addBanks,
	channelIsSendable,
	noOp,
	randomItemFromArray,
	roll,
	updateBankSetting
} from '../../../lib/util';
import { getNexGearStats } from '../../../lib/util/getNexGearStats';
import { sendToChannelID } from '../../../lib/util/webhook';

interface NexUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

export default class extends Task {
	async run({ channelID, userID, users, quantity, duration }: BossActivityTaskOptions) {
		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NexUser[] = [];

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await this.client.users.fetch(id).catch(noOp);
			if (!user) continue;
			const [data] = getNexGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id });
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const teamTable = new SimpleTable<string>();

			let teamFailed = false;
			for (const user of parsedUsers.sort((a, b) => b.chanceOfDeath - a.chanceOfDeath)) {
				const currentDeaths = Object.keys(deaths).length;
				if (calcWhatPercent(currentDeaths, users.length) >= 50) {
					// If over 50% of the team died, the entire team dies.
					teamFailed = true;
				}

				if (teamFailed || percentChance(user.chanceOfDeath)) {
					deaths[user.id] = Boolean(deaths[user.id]) ? deaths[user.id] + 1 : 1;
				} else {
					// weight on damagedone
					teamTable.add(user.id, user.damageDone);
				}
			}

			const loot = new Bank();
			loot.add(NexMonster.table.kill(1, {}));
			if (roll(80 + users.length * 2)) {
				loot.add(randomItemFromArray(allNexItems), 1);
			}
			const winner = teamTable.roll()?.item;
			if (!winner) continue;
			const currentLoot = teamsLoot[winner];
			if (!currentLoot) teamsLoot[winner] = loot.bank;
			else teamsLoot[winner] = addBanks([currentLoot, loot.bank]);

			kcAmounts[winner] = Boolean(kcAmounts[winner]) ? ++kcAmounts[winner] : 1;
		}

		const leaderUser = await this.client.users.fetch(userID);
		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${NexMonster.name}!\n\n`;
		const totalLoot = new Bank();
		for (let [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			if (kcAmounts[user.id]) {
				await addMonsterXP(user, {
					monsterID: 46274,
					quantity: Math.ceil(quantity / users.length),
					duration,
					isOnTask: false,
					taskQuantity: null
				});
			}
			totalLoot.add(loot);
			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(NexMonster.id, kcToAdd);
			const purple = Object.keys(loot).some(id => allNexItems.includes(parseInt(id)));

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${new Bank(
				loot
			)}||\n`;

			announceLoot(this.client, leaderUser, NexMonster, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		updateBankSetting(this.client, ClientSettings.EconomyStats.NexLoot, totalLoot);

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

		let debug = production
			? ''
			: `\`\`\`\n${JSON.stringify([parsedUsers, deaths], null, 4)}\n\`\`\``;

		if (users.length > 1) {
			if (Object.values(kcAmounts).length === 0) {
				sendToChannelID(this.client, channelID, {
					content: `${users
						.map(id => `<@${id}>`)
						.join(' ')} Your team all died, and failed to defeat Nex. ${debug}`
				});
			} else {
				sendToChannelID(this.client, channelID, {
					content: resultStr + debug
				});
			}
		} else {
			const channel = this.client.channels.cache.get(channelID);
			if (!channelIsSendable(channel)) return;

			if (!kcAmounts[userID]) {
				channel.send(
					`${leaderUser}, ${leaderUser.minionName} died in all their attempts to kill Nex, they apologize and promise to try harder next time.`
				);
			} else {
				channel.sendBankImage({
					bank: teamsLoot[userID],
					content: `${leaderUser}, ${
						leaderUser.minionName
					} finished killing ${quantity} ${NexMonster.name}, you died ${
						deaths[userID] ?? 0
					} times. Your Nex KC is now ${
						(leaderUser.settings.get(UserSettings.MonsterScores)[NexMonster.id] ?? 0) +
						quantity
					}.`,
					title: `${quantity}x Nex`,
					background: leaderUser.settings.get(UserSettings.BankBackground),
					user: leaderUser,
					flags: { showNewCL: 1 }
				});
			}
		}
	}
}

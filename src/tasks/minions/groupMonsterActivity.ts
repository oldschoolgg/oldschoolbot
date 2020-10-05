import { Task } from 'klasa';

import { Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../lib/minions/functions/isImportantItemForMonster';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';
import { addBanks, noOp, queuedMessageSend, randomItemFromArray } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends Task {
	async run({
		monsterID,
		channelID,
		quantity,
		users,
		leader,
		lfg
	}: GroupMonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1);
			const userWhoGetsLoot = randomItemFromArray(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = addBanks([currentLoot ?? {}, loot]);
			kcAmounts[userWhoGetsLoot] = Boolean(kcAmounts[userWhoGetsLoot])
				? ++kcAmounts[userWhoGetsLoot]
				: 1;
		}

		const leaderUser = await this.client.users.fetch(leader);

		let resultStr = '';
		const resultStrLfg: Record<string, string> = {};
		if (lfg) {
			for (const channel of Object.keys(lfg)) {
				resultStrLfg[
					channel
				] = `LFG mass of ${quantity}x ${monster.name} returned! Here are the spoils:\n\n`;
			}
		} else {
			resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		}

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;

			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), monster)
			);

			if (lfg) {
				for (const channel of Object.entries(lfg)) {
					resultStrLfg[channel[0]] += `${purple ? Emoji.Purple : ''} **${
						channel[1].includes(user.id) ? user : user.username
					} received:** ||${await createReadableItemListFromBank(this.client, loot)}||\n`;
				}
			} else {
				resultStr += `${
					purple ? Emoji.Purple : ''
				} **${user} received:** ||${await createReadableItemListFromBank(
					this.client,
					loot
				)}||\n`;
			}

			announceLoot(this.client, leaderUser, monster, quantity, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);
		if (usersWithoutLoot.length > 0) {
			resultStr += `${usersWithoutLoot.map(id => `<@${id}>`).join(', ')} - Got no loot, sad!`;
		}
		if (lfg) {
			for (const _channel of Object.keys(lfg)) {
				const channel = this.client.channels.get(_channel);
				if (channelIsSendable(channel)) {
					await queuedMessageSend(this.client, channel.id, resultStrLfg[_channel]);
				}
			}
		} else {
			await queuedMessageSend(this.client, channelID, resultStr);
		}
	}
}

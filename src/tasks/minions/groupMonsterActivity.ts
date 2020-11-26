import { Task } from 'klasa';

import { Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import announceLoot from '../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../lib/minions/functions/isImportantItemForMonster';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';
import { addBanks, noOp, queuedMessageSend, randomItemFromArray } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends Task {
	async run({
		monsterID,
		channelID,
		quantity,
		users,
		leader,
		hits
	}: GroupMonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};
		const hit = hits;
		console.log(hit);

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

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;

			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), monster)
			);

			resultStr += `${
				purple ? Emoji.Purple : ''
			} **${user} received:** ||${await createReadableItemListFromBank(
				this.client,
				loot
			)}||\n`;

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

		queuedMessageSend(this.client, channelID, resultStr);
	}
}

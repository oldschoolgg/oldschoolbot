import { Task } from 'klasa';

import { noOp, randomItemFromArray, addBankToBank, queuedMessageSend } from '../../lib/util';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';
import announceLoot from '../../lib/minions/functions/announceLoot';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends Task {
	async run({ monsterID, channelID, quantity, users, leader }: GroupMonsterActivityTaskOptions) {
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: ItemBank } = {};
		var kcAmounts: { [key: string]: number } = {};

		for (let j = 0; j < users.length; j++) {
			kcAmounts[users[j]] = 0;
		}

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1);
			const userWhoGetsLoot = randomItemFromArray(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = addBankToBank(currentLoot ?? {}, loot);
			kcAmounts[userWhoGetsLoot]++;
		}

		const leaderUser = await this.client.users.fetch(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;

			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(monsterID, kcToAdd);
			resultStr += `**${user} received:** ||${await createReadableItemListFromBank(
				this.client,
				loot
			)}||\n`;

			announceLoot(this.client, leaderUser, monster, quantity, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		queuedMessageSend(this.client, channelID, resultStr);
	}
}

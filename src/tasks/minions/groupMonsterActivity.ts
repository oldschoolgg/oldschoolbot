import { noOp, randArrItem } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import isImportantItemForMonster from '../../lib/minions/functions/isImportantItemForMonster';
import { GroupMonsterActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: GroupMonsterActivityTaskOptions) {
		const { monsterID, channelID, quantity, users, leader, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: Bank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1, {});
			const userWhoGetsLoot = randArrItem(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = loot.add(currentLoot);
			kcAmounts[userWhoGetsLoot] = Boolean(kcAmounts[userWhoGetsLoot]) ? ++kcAmounts[userWhoGetsLoot] : 1;
		}

		const leaderUser = await this.client.fetchUser(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		const totalLoot = new Bank();

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await this.client.fetchUser(userID).catch(noOp);
			if (!user) continue;
			await addMonsterXP(user, {
				monsterID,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			totalLoot.add(loot);
			await user.addItemsToBank({ items: loot, collectionLog: true });
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID => isImportantItemForMonster(parseInt(itemID), monster));

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${loot}||\n`;

			announceLoot({
				user,
				monsterID: monster.id,
				loot,
				notifyDrops: monster.notifyDrops,
				team: {
					leader: leaderUser,
					lootRecipient: user,
					size: users.length
				}
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);
		if (usersWithoutLoot.length > 0) {
			resultStr += `${usersWithoutLoot.map(id => `<@${id}>`).join(', ')} - Got no loot, sad!`;
		}

		handleTripFinish(this.client, leaderUser, channelID, resultStr, undefined, undefined, data, totalLoot);
	}
}

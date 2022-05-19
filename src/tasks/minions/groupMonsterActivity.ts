import { noOp, randArrItem, roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { addBanks, itemID } from 'oldschooljs/dist/util';

import { MysteryBoxes } from '../../lib/bsoOpenables';
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
			let loot = monster.table.kill(1, {});
			if (roll(10) && monster.id !== 696_969) {
				loot.multiply(4);
				loot.add(MysteryBoxes.roll());
			}
			const userWhoGetsLoot = randArrItem(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = loot.add(currentLoot);
			kcAmounts[userWhoGetsLoot] = Boolean(kcAmounts[userWhoGetsLoot]) ? ++kcAmounts[userWhoGetsLoot] : 1;
		}

		const leaderUser = await this.client.fetchUser(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		const totalLoot = new Bank();

		for (let [userID, loot] of Object.entries(teamsLoot)) {
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
			const kcToAdd = kcAmounts[user.id];
			if (user.equippedPet() === itemID('Ori') && duration > Time.Minute * 5) {
				loot.bank = addBanks([monster.table.kill(Math.ceil(kcToAdd * 0.25), {}).bank ?? {}, loot.bank]);
			}
			await user.addItemsToBank({ items: loot, collectionLog: true });
			totalLoot.add(loot);

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

		handleTripFinish(leaderUser, channelID, resultStr, undefined, undefined, data, totalLoot);
	}
}

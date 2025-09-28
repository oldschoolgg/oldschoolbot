import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { randArrItem, roll } from '@oldschoolgg/rng';
import { Emoji, noOp, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import { addMonsterXP } from '@/lib/minions/functions/index.js';
import isImportantItemForMonster from '@/lib/minions/functions/isImportantItemForMonster.js';
import type { GroupMonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const groupoMonsterTask: MinionTask = {
	type: 'GroupMonsterKilling',
	async run(data: GroupMonsterActivityTaskOptions) {
		const { mi: monsterID, channelID, q: quantity, users, leader, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: Bank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1, {});
			if (roll(10) && monster.id !== 696_969) {
				loot.multiply(4);
				loot.add(MysteryBoxes.roll());
			}
			const userWhoGetsLoot = randArrItem(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = loot.add(currentLoot);
			kcAmounts[userWhoGetsLoot] = kcAmounts[userWhoGetsLoot] ? ++kcAmounts[userWhoGetsLoot] : 1;
		}

		const leaderUser = await mUserFetch(leader);

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		const totalLoot = new Bank();

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await mUserFetch(userID).catch(noOp);
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
			if (user.usingPet('Ori') && duration > Time.Minute * 5) {
				loot.add(monster.table.kill(Math.ceil(kcToAdd * 0.25), {}));
			}
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
			totalLoot.add(loot);

			if (kcToAdd) await user.incrementKC(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(Number.parseInt(itemID), monster)
			);

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

		handleTripFinish(leaderUser, channelID, resultStr, undefined, data, totalLoot);
	}
};

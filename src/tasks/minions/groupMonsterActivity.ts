import { Emoji, noOp } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import isImportantItemForMonster from '@/lib/minions/functions/isImportantItemForMonster.js';
import type { GroupMonsterActivityTaskOptions } from '@/lib/types/minions.js';

export const groupoMonsterTask: MinionTask = {
	type: 'GroupMonsterKilling',
	async run(data: GroupMonsterActivityTaskOptions, { handleTripFinish, user: leaderUser, rng }) {
		const { mi: monsterID, channelId, q: quantity, users, duration } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: Bank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1, {});
			const userWhoGetsLoot = rng.pick(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = loot.add(currentLoot);
			kcAmounts[userWhoGetsLoot] = kcAmounts[userWhoGetsLoot] ? ++kcAmounts[userWhoGetsLoot] : 1;
		}

		let resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;
		const totalLoot = new Bank();

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await mUserFetch(userID).catch(noOp);
			if (!user) continue;
			await user.addMonsterXP({
				monsterID,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			const bullBones = loot.amount('Bull bones');
			if (bullBones > 0) {
				loot.remove('Bull bones', bullBones);
				await user.addXP({ skillName: 'prayer', amount: bullBones * 40 });
				resultStr += `**${user} buried ${bullBones} bull bones.**
`;
			}
			totalLoot.add(loot);
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
			if (bullBones > 0) {
				await user.addItemsToCollectionLog({ itemsToAdd: new Bank().add('Bull bones', bullBones) });
			}
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementKC(monsterID, kcToAdd);
			const purple = loot.items().some(([item]) => isImportantItemForMonster(item.id, monster));

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

		return handleTripFinish({ user: leaderUser, channelId, message: resultStr, data, loot: totalLoot });
	}
};

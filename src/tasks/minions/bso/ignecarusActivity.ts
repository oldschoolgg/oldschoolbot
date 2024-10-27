import { objectValues, percentChance, shuffleArr, sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { trackLoot } from '../../../lib/lootTrack';
import {
	Ignecarus,
	IgnecarusLootTable,
	IgnecarusNotifyDrops
} from '../../../lib/minions/data/killableMonsters/custom/bosses/Ignecarus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';

import { TeamLoot } from '../../../lib/simulation/TeamLoot';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import type { BossUser } from '../../../lib/structures/Boss';
import type { NewBossOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../../lib/util/webhook';

const methodsOfDeath = ['Burnt to death', 'Eaten', 'Crushed', 'Incinerated'];

export const ignecarusTask: MinionTask = {
	type: 'Ignecarus',
	async run(data: NewBossOptions) {
		const { channelID, users: idArr, duration, bossUsers: _bossUsers, quantity, userID } = data;
		const wrongFoodDeaths: MUser[] = [];
		const deaths: Record<string, { user: MUser; qty: number }> = {};
		const bossUsers: BossUser[] = await Promise.all(
			_bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await mUserFetch(u.user)
			}))
		);

		const teamLoot = new TeamLoot([]);

		// Deaths
		for (let i = 0; i < quantity; i++) {
			for (const { user, deathChance, itemsToRemove } of bossUsers) {
				let dead = false;
				if (itemsToRemove.has('Saradomin brew(4)')) {
					wrongFoodDeaths.push(user);
					dead = true;
				}
				if (dead || percentChance(deathChance)) {
					if (deaths[user.id]) deaths[user.id].qty++;
					else deaths[user.id] = { qty: 1, user };
				}
			}
		}

		const tagAll = bossUsers.map(u => u.user.toString()).join(', ');
		if (wrongFoodDeaths.length === bossUsers.length * quantity) {
			return sendToChannelID(channelID, {
				content: `${tagAll}\n\nYour team began the fight, but the intense heat of the dragons lair melted your potions, and spoiled them - with no food left to eat, your entire team died.`
			});
		}

		if (sumArr(objectValues(deaths).map(d => d.qty)) === idArr.length * quantity) {
			handleTripFinish(bossUsers[0].user, channelID, `${tagAll}\n\nYour team all died.`, undefined, data, null);
			return;
		}

		await Promise.all(bossUsers.map(u => u.user.incrementKC(Ignecarus.id, quantity)));

		const killStr = `Your team managed to slay ${quantity}x Ignecarus, everyone grabs some loot and escapes from the dragons lair.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		const totalLoot = new Bank();
		for (const { user } of bossUsers) {
			const usersTask = await getUsersCurrentSlayerInfo(user.id);
			const isOnTask =
				usersTask.assignedTask !== null &&
				usersTask.currentTask !== null &&
				usersTask.assignedTask.monsters.includes(Ignecarus.id);
			if (isOnTask) {
				await prisma.slayerTask.update({
					where: {
						id: usersTask.currentTask!.id
					},
					data: {
						quantity_remaining: Math.max(0, usersTask.currentTask!.quantity_remaining - quantity)
					}
				});
			}

			let lootRolls = quantity;
			if (deaths[user.id]) {
				if (deaths[user.id].qty === quantity) continue;
				else lootRolls = quantity - deaths[user.id].qty;
			}
			const loot = new Bank().add(IgnecarusLootTable.roll(lootRolls));
			if (isDoubleLootActive(duration)) {
				loot.multiply(2);
			}
			teamLoot.add(user.id, loot);
			totalLoot.add(loot);
			await addMonsterXP(user, {
				monsterID: Ignecarus.id,
				quantity,
				duration,
				isOnTask,
				taskQuantity: quantity
			});
			await user.addItemsToBank({ items: loot, collectionLog: true });
			const purple = loot.itemIDs.some(itemID => IgnecarusNotifyDrops.includes(itemID));
			resultStr += `\n${purple ? Emoji.Purple : ''}${user} received ${loot}.`;

			announceLoot({
				user,
				monsterID: Ignecarus.id,
				loot,
				notifyDrops: IgnecarusNotifyDrops,
				team: {
					leader: await mUserFetch(userID),
					lootRecipient: user,
					size: idArr.length
				}
			});
		}
		updateBankSetting('ignecarus_loot', totalLoot);

		// Show deaths in the result
		if (objectValues(deaths).length > 0) {
			resultStr += `\n\n**Died in battle**: ${objectValues(deaths).map(
				u =>
					`${u.user.toString()}${u.qty > 1 ? ` x${u.qty}` : ''} (${
						wrongFoodDeaths.includes(u.user)
							? 'Had no food'
							: shuffleArr([...methodsOfDeath])
									.slice(0, u.qty)
									.join(', ')
					})`
			)}.`;
		}

		await trackLoot({
			duration,
			totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: Ignecarus.name,
			kc: quantity,
			users: bossUsers.map(i => ({
				id: i.user.id,
				loot: teamLoot.get(i.user.id),
				duration
			}))
		});

		handleTripFinish(bossUsers[0].user, channelID, resultStr, undefined, data, null);
	}
};

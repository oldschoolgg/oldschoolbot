import type { NewBossOptions } from '@/lib/bso/bsoTypes.js';
import { isDoubleLootActive } from '@/lib/bso/doubleLoot.js';
import { BurningDominionTemplate } from '@/lib/bso/monsters/VerdantIsland.js';
import type { BossUser } from '@/lib/bso/structures/Boss.js';

import { Emoji, sumArr } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { trackLoot } from '@/lib/lootTrack.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';
import { getUsersCurrentSlayerInfo } from '@/lib/slayer/slayerUtil.js';

const methodsOfDeath = [
	'Incinerated by dragon breath',
	'Crushed by Orym',
	'Pierced by Orrodil',
	'Burnt to ashes',
	'Overwhelmed by both dragons'
];

const BurningDominionNotifyDrops = BurningDominionTemplate.allItems ?? [];

export const dominionTask: MinionTask = {
	type: 'BurningDominion',
	async run(data: NewBossOptions, { handleTripFinish, rng }) {
		const { channelId, users: idArr, duration, bossUsers: _bossUsers, quantity, userID } = data;
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

		for (let i = 0; i < quantity; i++) {
			for (const { user, deathChance, itemsToRemove } of bossUsers) {
				let dead = false;
				if (itemsToRemove.has('Saradomin brew(4)')) {
					wrongFoodDeaths.push(user);
					dead = true;
				}
				if (dead || rng.percentChance(deathChance)) {
					if (deaths[user.id]) deaths[user.id].qty++;
					else deaths[user.id] = { qty: 1, user };
				}
			}
		}

		const tagAll = bossUsers.map(u => u.user.toString()).join(', ');

		if (wrongFoodDeaths.length === bossUsers.length * quantity) {
			return handleTripFinish({
				user: bossUsers[0].user,
				channelId,
				message: `${tagAll}\n\nYour team began the fight against Orym and Orrodil, but your supplies could not keep pace with both dragons - with no proper provisions left, your entire team perished in the Burning Dominion.`,
				data
			});
		}

		if (sumArr(Object.values(deaths).map(d => d.qty)) === idArr.length * quantity) {
			return handleTripFinish({
				user: bossUsers[0].user,
				channelId,
				message: `${tagAll}\n\nYour full team perished against the twin dragons of the Burning Dominion...`,
				data
			});
		}

		await Promise.all(bossUsers.flatMap(u => [u.user.incrementKC(BurningDominionTemplate.id, quantity)]));

		const killStr = `Your team managed to slay Orym and Orrodil ${quantity} time${quantity > 1 ? 's' : ''}, everyone grabs some loot and escapes from the Burning Dominion.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		const totalLoot = new Bank();
		for (const { user } of bossUsers) {
			const usersTask = await getUsersCurrentSlayerInfo(user.id);
			const isOnTask =
				usersTask.assignedTask !== null &&
				usersTask.currentTask !== null &&
				usersTask.assignedTask.monsters.includes(BurningDominionTemplate.id);

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

			const loot = new Bank().add(BurningDominionTemplate.table.roll(lootRolls));

			if (isDoubleLootActive(duration)) {
				loot.multiply(2);
			}

			teamLoot.add(user.id, loot);
			totalLoot.add(loot);

			await user.addMonsterXP({
				monsterID: BurningDominionTemplate.id,
				quantity,
				duration,
				isOnTask,
				taskQuantity: quantity
			});

			await user.addItemsToBank({ items: loot, collectionLog: true });

			const purple = loot.itemIDs.some(itemID => BurningDominionNotifyDrops.includes(itemID));
			resultStr += `\n${purple ? Emoji.Purple : ''}${user} received ${loot}.`;

			announceLoot({
				user,
				monsterID: BurningDominionTemplate.id,
				loot,
				notifyDrops: BurningDominionNotifyDrops,
				team: {
					leader: await mUserFetch(userID),
					lootRecipient: user,
					size: idArr.length
				}
			});
		}

		if (Object.values(deaths).length > 0) {
			resultStr += `\n\n**Died in battle**: ${Object.values(deaths)
				.map(
					u =>
						`${u.user.toString()}${u.qty > 1 ? ` x${u.qty}` : ''} (${
							wrongFoodDeaths.includes(u.user)
								? 'Had no proper supplies'
								: rng
										.shuffle([...methodsOfDeath])
										.slice(0, u.qty)
										.join(', ')
						})`
				)
				.join(', ')}.`;
		}

		await trackLoot({
			duration,
			totalLoot,
			type: 'Monster',
			changeType: 'loot',
			id: BurningDominionTemplate.name,
			kc: quantity,
			users: bossUsers.map(i => ({
				id: i.user.id,
				loot: teamLoot.get(i.user.id),
				duration
			}))
		});

		return handleTripFinish({ user: bossUsers[0].user, channelId, message: resultStr, data });
	}
};

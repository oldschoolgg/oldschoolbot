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
	'Overwhelmed by both dragons',
	'Melted into a puddle',
	'Turned into dragon food',
	'Roasted alive',
	'Caught between twin flames',
	'Scorched beyond recognition',
	'Impaled by flaming claws',
	'Reduced to cinders',
	'Smashed into the ground',
	'Tail-whipped into oblivion',
	'Forgot to drink heat resistance',
	'Underestimated the heat',
	'Became a crispy snack',
	'Failed the DPS check',
	'Stood in the fire',
	'Tanked a tail swipe',
	'Ate a fireball to the face',
	'Got combo\'d to death',
	'Forgot to eat',
	'Panic-ate too late',
	'Tried to tank it',
	'Got greedy with DPS',
	'Missed the dodge',
	'Lagged at the worst moment',
	'Got absolutely cooked',
	'Literally got smoked',
	'Became well-done steak',
	'Thought they were invincible',
	'Tried to solo tank',
	'Forgot about the other dragon',
	'Got sandwiched',
	'Stood in stupid',
	'Zigged when they should have zagged',
	'Became a floor tank',
	'Needed a better gaming chair'
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

		for (const user of bossUsers.map(u => u.user)) {
			const userDeaths = deaths[user.id]?.qty ?? 0;
			const userSuccessfulKills = quantity - userDeaths;
			await user.incrementKC(BurningDominionTemplate.id, userSuccessfulKills);
		}

		const killStr = `Your team fought Orym and Orrodil ${quantity} time${quantity > 1 ? 's' : ''}.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		const totalLoot = new Bank();
		const userResults: string[] = [];

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

			const userDeaths = deaths[user.id]?.qty ?? 0;
			const userSuccessfulKills = quantity - userDeaths;

			if (userSuccessfulKills === 0) {
				userResults.push(
					`${user}: Died on all ${quantity} kill${quantity > 1 ? 's' : ''} (${
						wrongFoodDeaths.includes(user)
							? 'Had no proper supplies'
							: rng
									.shuffle([...methodsOfDeath])
									.slice(0, userDeaths)
									.join(', ')
					})`
				);
				continue;
			}

			const loot = new Bank().add(BurningDominionTemplate.table.roll(userSuccessfulKills));

			if (isDoubleLootActive(duration)) {
				loot.multiply(2);
			}

			teamLoot.add(user.id, loot);
			totalLoot.add(loot);

			await user.addMonsterXP({
				monsterID: BurningDominionTemplate.id,
				quantity: userSuccessfulKills,
				duration,
				isOnTask,
				taskQuantity: userSuccessfulKills
			});

			await user.addItemsToBank({ items: loot, collectionLog: true });

			const notifyDropIDs = BurningDominionNotifyDrops.map((item: any) => item.id ?? item);
			const purple = loot.itemIDs.some(itemID => notifyDropIDs.includes(itemID));

			let userResult = `${purple ? Emoji.Purple : ''}${user}: ${userSuccessfulKills}/${quantity} kills`;
			
			if (userDeaths > 0) {
				userResult += ` (died ${userDeaths}x: ${
					wrongFoodDeaths.includes(user)
						? 'Had no proper supplies'
						: rng
								.shuffle([...methodsOfDeath])
								.slice(0, Math.min(userDeaths, 3))
								.join(', ')
				})`;
			}

			if (purple) {
				const uniqueLoot = new Bank();
				const regularLoot = new Bank();
				
				for (const [itemID, qty] of loot.items()) {
					if (notifyDropIDs.includes(itemID)) {
						uniqueLoot.add(itemID, qty);
					} else {
						regularLoot.add(itemID, qty);
					}
				}

				const sortedLoot = uniqueLoot.clone().add(regularLoot);
				userResult += ` - ||${sortedLoot}||`;
			} else {
				userResult += ` - ${loot}`;
			}
			
			userResults.push(userResult);

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

		resultStr += '\n' + userResults.join('\n');

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
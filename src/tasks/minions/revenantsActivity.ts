import { Prisma } from '@prisma/client';
import { deepClone, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { trackLoot } from '../../lib/lootTrack';
import { revenantMonsters } from '../../lib/minions/data/killableMonsters/revs';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { prisma } from '../../lib/settings/prisma';
import { SkillsEnum } from '../../lib/skilling/types';
import { calculateSlayerPoints, getUsersCurrentSlayerInfo, isOnSlayerTask } from '../../lib/slayer/slayerUtil';
import { Gear } from '../../lib/structures/Gear';
import type { RevenantOptions } from '../../lib/types/minions';
import { hasSkillReqs } from '../../lib/util';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';

export const revenantsTask: MinionTask = {
	type: 'Revenants',
	async run(data: RevenantOptions) {
		const { monsterID, userID, channelID, quantity, died, skulled, duration } = data;
		const monster = revenantMonsters.find(mon => mon.id === monsterID)!;
		const user = await mUserFetch(userID);
		if (died) {
			// 1 in 20 to get smited without prayer potions and 1 in 300 if the user has prayer potions
			const hasPrayerLevel = hasSkillReqs(user, { [SkillsEnum.Prayer]: 25 })[0];
			const protectItem = roll(data.usingPrayerPots ? 300 : 20) ? false : hasPrayerLevel;
			const userGear = { ...deepClone(user.gear.wildy.raw()) };

			const calc = calculateGearLostOnDeathWilderness({
				gear: userGear,
				smited: hasPrayerLevel && !protectItem,
				protectItem: hasPrayerLevel,
				after20wilderness: true,
				skulled
			});

			const image = await generateGearImage(user, new Gear(calc.newGear), 'wildy', null);
			await user.update({
				gear_wildy: calc.newGear as Prisma.InputJsonObject
			});

			updateBankSetting('revs_cost', calc.lostItems);
			// Track items lost
			await trackLoot({
				totalCost: calc.lostItems,
				id: monster.name,
				type: 'Monster',
				changeType: 'cost',
				users: [
					{
						id: user.id,
						cost: calc.lostItems
					}
				]
			});
			// Track loot (For duration)
			await trackLoot({
				totalLoot: new Bank(),
				id: monster.name,
				type: 'Monster',
				changeType: 'loot',
				duration,
				kc: quantity,
				users: [
					{
						id: user.id,
						loot: new Bank(),
						duration
					}
				]
			});

			handleTripFinish(
				user,
				channelID,
				`${user} ${
					hasPrayerLevel && !protectItem
						? `Oh no! While running for your life, you panicked, got smited ${
								skulled ? 'and lost everything!' : "and couldn't protect a 4th item."
						  }`
						: ''
				} You died, you lost all your loot, and these equipped items: ${
					calc.lostItems
				}.\nHere is what you saved:`,
				image,
				data,
				null
			);
			return;
		}

		const { newKC } = await user.incrementKC(monsterID, quantity);

		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}.`;

		// Add slayer
		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.currentTask !== null &&
			usersTask.currentTask !== undefined &&
			usersTask.currentTask.monster_id === Monsters.RevenantImp.id;

		const isOnTaskResult = await isOnSlayerTask({ user, monsterID, quantityKilled: quantity });

		let thisTripFinishesTask = false;

		if (isOnTaskResult.isOnTask) {
			const { quantitySlayed } = isOnTaskResult;
			const quantityLeft = Math.max(0, isOnTaskResult.currentTask!.quantity_remaining - quantitySlayed);

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const newStats = await userStatsUpdate(
					user.id,
					{
						slayer_wildy_task_streak: {
							increment: 1
						}
					},
					{ slayer_wildy_task_streak: true }
				);
				const currentStreak = newStats.slayer_wildy_task_streak;
				const points = await calculateSlayerPoints(currentStreak, isOnTaskResult.slayerMaster, user);
				const secondNewUser = await user.update({
					slayer_points: {
						increment: points
					}
				});
				str += `\n**You've completed ${currentStreak} wilderness tasks and received ${points} points; giving you a total of ${secondNewUser.newUser.slayer_points}; return to a Slayer master.**`;
			} else {
				str += `\nYou killed ${quantitySlayed}x of your ${
					isOnTaskResult.currentTask!.quantity_remaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}
			await prisma.slayerTask.update({
				where: {
					id: isOnTaskResult.currentTask!.id
				},
				data: {
					quantity_remaining: quantityLeft
				}
			});
		}

		const xpRes: string[] = [];
		xpRes.push(
			await addMonsterXP(user, {
				monsterID,
				quantity,
				duration,
				isOnTask: isOnTaskResult.isOnTask,
				taskQuantity: isOnTaskResult.isOnTask ? isOnTaskResult.quantitySlayed : null,
				minimal: true
			})
		);

		const loot = monster.table.kill(quantity, { onSlayerTask: isOnTask });

		str += ` Your ${monster.name} KC is now ${newKC}.\n\n${xpRes.join(' ')}`;

		announceLoot({
			user,
			monsterID: monster.id,
			loot,
			notifyDrops: monster.notifyDrops
		});

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			itemsToAdd: loot,
			collectionLog: true
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: monster.name,
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot: itemsAdded,
					duration
				}
			]
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${monster.name} (${skulled ? 'skulled' : 'unskulled'}):`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};

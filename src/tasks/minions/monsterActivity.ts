import { MonsterKillOptions, Monsters } from 'oldschooljs';

import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { trackLoot } from '../../lib/lootTrack';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { prisma } from '../../lib/settings/prisma';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { calculateSlayerPoints, isOnSlayerTask } from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { ashSanctifierEffect } from '../../lib/util/ashSanctifier';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration, usingCannon, cannonMulti, burstOrBarrage } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await mUserFetch(userID);
		const [hasKourendHard] = await userhasDiaryTier(user, KourendKebosDiary.hard);
		await user.incrementKC(monsterID, quantity);

		const isOnTaskResult = await isOnSlayerTask({ user, monsterID, quantityKilled: quantity });

		const superiorTable = isOnTaskResult.hasSuperiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = !usingCannon ? monster.existsInCatacombs ?? undefined : undefined;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTaskResult.isOnTask,
			slayerMaster: isOnTaskResult.isOnTask ? isOnTaskResult.slayerMaster.osjsEnum : undefined,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs
		};

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;
		if (superiorTable && isOnTaskResult.isOnTask) {
			for (let i = 0; i < quantity; i++) if (roll(200)) newSuperiorCount++;
		}
		// Regular loot
		const loot = monster.table.kill(quantity - newSuperiorCount, killOptions);
		if (monster.specialLoot) {
			monster.specialLoot(loot, user, data);
		}
		if (newSuperiorCount) {
			// Superior loot and totems if in catacombs
			loot.add(superiorTable!.kill(newSuperiorCount));
			if (isInCatacombs) loot.add('Dark totem base', newSuperiorCount);
		}

		const xpRes: string[] = [];
		xpRes.push(
			await addMonsterXP(user, {
				monsterID,
				quantity,
				duration,
				isOnTask: isOnTaskResult.isOnTask,
				taskQuantity: isOnTaskResult.isOnTask ? isOnTaskResult.quantitySlayed : null,
				minimal: true,
				usingCannon,
				cannonMulti,
				burstOrBarrage,
				superiorCount: newSuperiorCount
			})
		);

		if (hasKourendHard) await ashSanctifierEffect(user, loot, duration, xpRes);

		announceLoot({
			user: await mUserFetch(user.id),
			monsterID: monster.id,
			loot,
			notifyDrops: monster.notifyDrops
		});

		if (newSuperiorCount && newSuperiorCount > 0) {
			await userStatsUpdate(
				user.id,
				{
					slayer_superior_count: {
						increment: newSuperiorCount
					}
				},
				{}
			);
		}
		const superiorMessage = newSuperiorCount ? `, including **${newSuperiorCount} superiors**` : '';
		let str =
			`${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
			` Your ${monster.name} KC is now ${user.getKC(monsterID)}.\n\n${xpRes.join(' ')}\n`;
		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasEquipped('Iron dagger') &&
			!user.hasEquippedOrInBank(['Clue hunter cloak'])
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');

			str += '\n\nWhile killing a Unicorn, you discover some strange clothing in the ground - you pick them up.';
		}

		let thisTripFinishesTask = false;

		if (isOnTaskResult.isOnTask) {
			const { quantitySlayed } = isOnTaskResult;
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				isOnTaskResult.currentTask!.monster_id !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id &&
					  isOnTaskResult.currentTask.monster_id !== Monsters.Kreearra.id
					? quantitySlayed * 4
					: monsterID === Monsters.GrotesqueGuardians.id &&
					  user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
					? quantitySlayed * 2
					: quantitySlayed;

			const quantityLeft = Math.max(0, isOnTaskResult.currentTask!.quantity_remaining - effectiveSlayed);

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const newStats = await userStatsUpdate(
					user.id,
					{
						slayer_task_streak: {
							increment: 1
						}
					},
					{ slayer_task_streak: true }
				);
				const currentStreak = newStats.slayer_task_streak;
				const points = await calculateSlayerPoints(currentStreak, isOnTaskResult.slayerMaster, user);
				const secondNewUser = await user.update({
					slayer_points: {
						increment: points
					}
				});
				str += `\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${secondNewUser.newUser.slayer_points}; return to a Slayer master.**`;
				if (isOnTaskResult.assignedTask.isBoss) {
					str += ` ${await user.addXP({ skillName: SkillsEnum.Slayer, amount: 5000, minimal: true })}`;
					str += ' for completing your boss task.';
				}
			} else {
				str += `\nYou killed ${effectiveSlayed}x of your ${
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

		const messages: string[] = [];
		if (monster.effect) {
			await monster.effect({
				user,
				quantity,
				monster,
				loot,
				data,
				messages
			});
		}
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		await trackLoot({
			totalLoot: itemsAdded,
			id: monster.name.toString(),
			type: 'Monster',
			changeType: 'loot',
			kc: quantity,
			duration,
			users: [
				{
					id: user.id,
					loot: itemsAdded,
					duration
				}
			]
		});

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded,
						title: `Loot From ${quantity} ${monster.name}:`,
						user,
						previousCL
				  });

		handleTripFinish(user, channelID, str, image?.file.attachment, data, itemsAdded, messages);
	}
};

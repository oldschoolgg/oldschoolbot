import { Prisma } from '@prisma/client';
import { deepClone, percentChance, Time } from 'e';
import { Bank, MonsterKillOptions, Monsters } from 'oldschooljs';

import { Emoji } from '../../lib/constants';
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
import { calculateSimpleMonsterDeathChance, hasSkillReqs, roll } from '../../lib/util';
import { ashSanctifierEffect } from '../../lib/util/ashSanctifier';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		let {
			monsterID,
			userID,
			channelID,
			quantity,
			duration,
			usingCannon,
			cannonMulti,
			burstOrBarrage,
			died,
			pkEncounters,
			hasWildySupplies,
			isInWilderness
		} = data;

		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const revenants = monster.name.includes('Revenant');

		let skulled = false;
		if (revenants) skulled = true;

		const messages: string[] = [];

		const user = await mUserFetch(userID);
		const [hasKourendHard] = await userhasDiaryTier(user, KourendKebosDiary.hard);
		const currentKCs = await user.fetchMonsterScores();

		// Wilderness PK Encounters and PK Deaths
		// Handle remaining anti-pk supplies if any
		if (hasWildySupplies) {
			const antiPKSupplies = new Bank()
				.add('Saradomin brew(4)', Math.max(1, Math.floor(duration / (4 * Time.Minute))))
				.add('Super restore(4)', Math.max(1, Math.floor(duration / (8 * Time.Minute))))
				.add('Cooked karambwan', Math.max(1, Math.floor(duration / (4 * Time.Minute))));

			for (let i = 0; i < (pkEncounters ?? -1); i++) {
				if (percentChance(2) || died) {
					antiPKSupplies.bank = {};
					break;
				} else if (percentChance(10)) {
					antiPKSupplies
						.remove('Saradomin brew(4)', 1)
						.remove('Super restore(4)', 1)
						.remove('Cooked karambwan', 1);
				}
			}

			// Return remaining anti-pk supplies
			if (antiPKSupplies.amount('Saradomin brew(4)') > 0) {
				const { itemsAdded } = await transactItems({
					userID: user.id,
					collectionLog: true,
					itemsToAdd: antiPKSupplies
				});
				messages.push(`Here is your remaining anti-pk supplies: ${itemsAdded}`);
			}
		}

		if (pkEncounters && pkEncounters > 0) {
			// Handle lost kc quantity because of pkers
			const lostQuantity = Math.max(
				Math.round((quantity / (Math.round(duration / Time.Minute) * (died ? 1 : 2))) * pkEncounters),
				1
			);
			if (lostQuantity > 0) {
				quantity -= lostQuantity;
				quantity = Math.max(0, quantity);
				messages.push(
					`You missed out on ${lostQuantity}x kills because of pk encounters${died ? ' and death' : ''}`
				);
			}

			// Handle death
			if (died) {
				// 1 in 20 to get smited without antiPKSupplies and 1 in 300 if the user has super restores
				const hasPrayerLevel = hasSkillReqs(user, { [SkillsEnum.Prayer]: 25 })[0];
				const protectItem = roll(hasWildySupplies ? 300 : 20) ? false : hasPrayerLevel;
				const userGear = { ...deepClone(user.gear.wildy.raw()) };

				const calc = calculateGearLostOnDeathWilderness({
					gear: userGear,
					smited: hasPrayerLevel && !protectItem,
					protectItem: hasPrayerLevel,
					after20wilderness: monster.pkBaseDeathChance && monster.pkBaseDeathChance >= 5 ? true : false,
					skulled
				});

				let reEquipedItems = false;
				if (!user.bank.has(calc.lostItems)) {
					await user.update({
						gear_wildy: calc.newGear as Prisma.InputJsonObject
					});
				} else {
					await user.specialRemoveItems(calc.lostItems);
					reEquipedItems = true;
				}

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

				messages.push(
					`${
						hasPrayerLevel && !protectItem
							? "Oh no! While running for your life, you panicked, got smited and couldn't protect a 4th item. "
							: ''
					}You died, you lost a lot of loot, and these equipped items: ${calc.lostItems}..${
						reEquipedItems ? ' Your minion equips similar lost items from bank.' : ''
					}`
				);
			}
		}

		// Monster deaths
		let deaths = 0;
		if (monster.deathProps) {
			const currentKC: number | undefined = currentKCs[monsterID];
			const deathChance = calculateSimpleMonsterDeathChance({ ...monster.deathProps, currentKC });
			for (let i = 0; i < quantity; i++) {
				if (percentChance(deathChance)) {
					deaths++;
				}
			}
		}
		quantity -= deaths;

		const awakenedMonsters = [
			Monsters.AwakenedDukeSucellus.id,
			Monsters.AwakenedTheLeviathan.id,
			Monsters.AwakenedTheWhisperer.id,
			Monsters.AwakenedVardorvis.id
		];
		const isAwakened = awakenedMonsters.includes(monsterID);
		if (
			quantity > 0 &&
			!user.owns('Ancient blood ornament kit') &&
			awakenedMonsters.every(id => Boolean(currentKCs[id]) || monsterID === id) &&
			isAwakened
		) {
			messages.push('You received an **Ancient blood ornament kit**!');
			await user.addItemsToBank({
				items: new Bank().add('Ancient blood ornament kit', 1),
				collectionLog: !user.cl.has('Ancient blood ornament kit')
			});
		}

		const { newKC } = await user.incrementKC(monsterID, quantity);

		const isOnTaskResult = await isOnSlayerTask({ user, monsterID, quantityKilled: quantity });

		const superiorTable = isOnTaskResult.hasSuperiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = (!usingCannon ? monster.existsInCatacombs ?? undefined : undefined) && !isInWilderness;

		const ringOfWealthI = (user.gear.wildy.hasEquipped('Ring of wealth (i)') && isInWilderness) as boolean;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTaskResult.isOnTask,
			slayerMaster: isOnTaskResult.isOnTask ? isOnTaskResult.slayerMaster.osjsEnum : undefined,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs,
			lootTableOptions: {
				tertiaryItemPercentageChanges: user.buildTertiaryItemChanges(ringOfWealthI)
			}
		};

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;

		if (superiorTable && isOnTaskResult.isOnTask) {
			if (!(isInWilderness && monster.name === 'Bloodveld')) {
				let superiorDroprate = 200;
				if (user.hasCompletedCATier('elite')) {
					superiorDroprate = 150;
					messages.push(`${Emoji.CombatAchievements} 25% more common superiors due to Elite CA tier`);
				}

				for (let i = 0; i < quantity; i++) {
					if (roll(superiorDroprate)) {
						newSuperiorCount++;
					}
				}
			}
		}

		// Regular loot
		const finalQuantity = quantity - newSuperiorCount;
		const loot = monster.table.kill(finalQuantity, killOptions);
		if (monster.specialLoot) {
			monster.specialLoot({ loot, ownedItems: user.allItemsOwned, quantity: finalQuantity });
		}
		if (newSuperiorCount) {
			// Superior loot and totems if in catacombs
			loot.add(superiorTable!.kill(newSuperiorCount));
			if (isInCatacombs) loot.add('Dark totem base', newSuperiorCount);
			if (isInWilderness) loot.add("Larran's key", newSuperiorCount);
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
			user,
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
			` Your ${monster.name} KC is now ${newKC}.\n\n${xpRes.join(' ')}\n`;
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
			if (thisTripFinishesTask && isOnTaskResult.slayerMaster.id === 8) {
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
			} else if (thisTripFinishesTask && isOnTaskResult.slayerMaster.id !== 8) {
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

		if (deaths > 0) {
			messages.push(`You died ${deaths}x times.`);
		}
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

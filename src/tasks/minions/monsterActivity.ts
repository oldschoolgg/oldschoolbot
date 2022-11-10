import { Bank, MonsterKillOptions, Monsters } from 'oldschooljs';

import { checkDegradeableItemCharges, degradeItem } from '../../lib/degradeableItems';
import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { trackLoot } from '../../lib/lootTrack';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { prisma } from '../../lib/settings/prisma';
import { ashes } from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { calculateSlayerPoints, getSlayerMasterOSJSbyID, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { BitField } from './../../lib/constants';

export async function ashSanctifierEffect(user: MUser, loot: Bank, duration: number, messages: string[]) {
	if (!user.bank.has('Ash sanctifier')) return;
	if (user.bitfield.includes(BitField.DisableAshSanctifier)) return;

	const [hasEliteDiary] = await userhasDiaryTier(user, KourendKebosDiary.elite);
	const ashXpModifider = hasEliteDiary ? 1 : 0.5;

	let startingAshSanctifierCharges = await checkDegradeableItemCharges({
		item: getOSItem('Ash sanctifier'),
		user
	});

	if (startingAshSanctifierCharges === 0) return;

	let chargesLeft = startingAshSanctifierCharges;
	let totalXP = 0;

	const ashesSanctified: { name: string; amount: number }[] = [];
	for (const ash of ashes) {
		const amount = loot.amount(ash.inputId);
		if (amount > 0 && chargesLeft >= amount) {
			totalXP += ash.xp * ashXpModifider * amount;
			ashesSanctified.push({ name: ash.name, amount });
			loot.remove(ash.inputId, amount);
			chargesLeft -= amount;
		} else if (amount > 0 && chargesLeft < amount) {
			totalXP += ash.xp * ashXpModifider * chargesLeft;
			ashesSanctified.push({ name: ash.name, amount: chargesLeft });
			loot.remove(ash.inputId, chargesLeft);
			chargesLeft = 0;
			break;
		}
	}

	if (startingAshSanctifierCharges - chargesLeft === 0) return;

	await degradeItem({
		item: getOSItem('Ash sanctifier'),
		chargesToDegrade: startingAshSanctifierCharges - chargesLeft,
		user
	});

	userStatsUpdate(user.id, () => ({
		ash_sanctifier_prayer_xp: {
			increment: Math.floor(totalXP)
		}
	}));
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Prayer,
		amount: totalXP,
		duration,
		minimal: true,
		multiplier: false
	});

	const ashString = ashesSanctified.map(ash => `${ash.amount}x ${ash.name}`).join(', ');
	messages.push(
		`${xpStr} Prayer XP from purifying ${ashString} using the Ash Sanctifier (${chargesLeft} charges left).`
	);
}

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		const { monsterID, userID, channelID, quantity, duration, usingCannon, cannonMulti, burstOrBarrage } = data;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		const user = await mUserFetch(userID);
		const [hasKourendHard] = await userhasDiaryTier(user, KourendKebosDiary.hard);
		await user.incrementKC(monsterID, quantity);

		const usersTask = await getUsersCurrentSlayerInfo(user.id);
		const isOnTask =
			usersTask.assignedTask !== null &&
			usersTask.currentTask !== null &&
			usersTask.assignedTask.monsters.includes(monsterID);
		const quantitySlayed = isOnTask ? Math.min(usersTask.currentTask!.quantity_remaining, quantity) : null;

		const mySlayerUnlocks = user.user.slayer_unlocks;

		const slayerMaster = isOnTask ? getSlayerMasterOSJSbyID(usersTask.slayerMaster!.id) : undefined;
		// Check if superiors unlock is purchased
		const superiorsUnlocked = isOnTask
			? mySlayerUnlocks.includes(SlayerTaskUnlocksEnum.BiggerAndBadder)
			: undefined;

		const superiorTable = superiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = !usingCannon ? monster.existsInCatacombs ?? undefined : undefined;

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTask,
			slayerMaster,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs
		};

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;
		if (superiorTable && isOnTask) {
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
				isOnTask,
				taskQuantity: quantitySlayed,
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
			await user.update({
				slayer_superior_count: {
					increment: newSuperiorCount
				}
			});
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

		if (isOnTask) {
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				usersTask.currentTask!.monster_id !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id && usersTask.currentTask!.monster_id !== Monsters.Kreearra.id
					? quantitySlayed! * 4
					: monsterID === Monsters.GrotesqueGuardians.id &&
					  user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
					? quantitySlayed! * 2
					: quantitySlayed!;

			const quantityLeft = Math.max(0, usersTask.currentTask!.quantity_remaining - effectiveSlayed);

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask) {
				const { newUser } = await user.update({
					slayer_task_streak: {
						increment: 1
					}
				});
				const currentStreak = newUser.slayer_task_streak;
				const points = await calculateSlayerPoints(currentStreak, usersTask.slayerMaster!, user);
				const secondNewUser = await user.update({
					slayer_points: {
						increment: points
					}
				});
				str += `\n**You've completed ${currentStreak} tasks and received ${points} points; giving you a total of ${secondNewUser.newUser.slayer_points}; return to a Slayer master.**`;
				if (usersTask.assignedTask?.isBoss) {
					str += ` ${await user.addXP({ skillName: SkillsEnum.Slayer, amount: 5000, minimal: true })}`;
					str += ' for completing your boss task.';
				}
			} else {
				str += `\nYou killed ${effectiveSlayed}x of your ${
					usersTask.currentTask!.quantity_remaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}
			await prisma.slayerTask.update({
				where: {
					id: usersTask.currentTask!.id
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

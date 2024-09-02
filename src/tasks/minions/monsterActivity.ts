import { Time, deepClone, percentChance } from 'e';
import type { MonsterKillOptions } from 'oldschooljs';
import { Bank, EMonster, Monsters } from 'oldschooljs';

import { type BitField, Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { type AttackStyles, addMonsterXPRaw } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';

import { userhasDiaryTierSync } from '../../lib/diaries';
import { DiaryID } from '../../lib/minions/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { type CurrentSlayerInfo, calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { type KCBank, safelyMakeKCBank } from '../../lib/structures/Bank';
import type { GearBank } from '../../lib/structures/GearBank';
import { MUserStats } from '../../lib/structures/MUserStats';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { calculateSimpleMonsterDeathChance, roll } from '../../lib/util';
import { ashSanctifierEffect } from '../../lib/util/ashSanctifier';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';

function handleSlayerTaskCompletion({
	slayerContext,
	updateBank,
	userStats,
	hasKourendElite
}: {
	hasKourendElite: boolean;
	userStats: MUserStats;
	slayerContext: ReturnType<typeof getSlayerContext>;
	updateBank: UpdateBank;
}) {
	if (!slayerContext.isOnTask) {
		throw new Error('handleSlayerTaskCompletion called when not on task.');
	}
	const isWildyTask = slayerContext.isUsingKrystilia;
	const key = isWildyTask ? 'slayer_wildy_task_streak' : 'slayer_task_streak';
	const currentStreak = isWildyTask ? userStats.slayerWildyTaskStreak : userStats.slayerTaskStreak;
	const newStreak = currentStreak + 1;
	const points = calculateSlayerPoints(newStreak, slayerContext.slayerMaster, hasKourendElite);

	updateBank.userStats[key] = {
		increment: 1
	};
	updateBank.userUpdates.slayer_points = {
		increment: points
	};

	let message = `\n**You've completed ${newStreak} ${isWildyTask ? 'wilderness ' : ''}tasks and received ${points} points; giving you a total of TODO; return to a Slayer master.**`;
	if (slayerContext.assignedTask.isBoss) {
		updateBank.xpBank.add('slayer', 5000);
		message += ' You received 5000 bonus Slayer XP for doing a boss task.';
	}

	return message;
}

function getSlayerContext({
	slayerInfo,
	monsterID,
	quantityKilled,
	slayerUnlocks
}: {
	slayerInfo: CurrentSlayerInfo;
	monsterID: number;
	quantityKilled: number;
	slayerUnlocks: SlayerTaskUnlocksEnum[];
}) {
	const isOnTask =
		slayerInfo.assignedTask !== null &&
		slayerInfo.currentTask !== null &&
		slayerInfo.assignedTask.monsters.includes(monsterID);

	const hasSuperiorsUnlocked = slayerUnlocks.includes(SlayerTaskUnlocksEnum.BiggerAndBadder);

	if (!isOnTask) return { isOnTask, hasSuperiorsUnlocked };
	const quantityRemaining = slayerInfo.currentTask.quantity_remaining;
	const slayerTaskMonsterID = slayerInfo.currentTask.monster_id;
	const slayerMaster = slayerInfo.slayerMaster;

	const quantitySlayed = Math.min(quantityRemaining, quantityKilled);

	let effectiveSlayed = quantitySlayed;

	// TODO: is this even right? it looks wrong
	if (monsterID === EMonster.KRIL_TSUTSAROTH && slayerTaskMonsterID !== Monsters.KrilTsutsaroth.id) {
		effectiveSlayed = quantitySlayed * 2;
	} else if (monsterID === EMonster.KREEARRA && slayerTaskMonsterID !== Monsters.Kreearra.id) {
		effectiveSlayed = quantitySlayed * 4;
	} else if (
		monsterID === EMonster.GROTESQUE_GUARDIANS &&
		slayerUnlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
	) {
		effectiveSlayed = quantitySlayed * 2;
	}

	const quantityLeft = Math.max(0, quantityRemaining - effectiveSlayed);
	const isUsingKrystilia = slayerMaster.id === 8;

	return {
		isOnTask,
		hasSuperiorsUnlocked,
		quantitySlayed,
		effectiveSlayed,
		quantityLeft,
		isUsingKrystilia,
		...slayerInfo
	};
}

interface newOptions {
	type: 'MonsterKilling';
	mi: number;
	q: number;
	iQty?: number;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	chinning?: boolean;
	bob?: number;
	died?: boolean;
	pkEncounters?: number;
	hasWildySupplies?: boolean;
	isInWilderness?: boolean;
	duration: number;
	hasEliteCA: boolean;
	hasKourendHard: boolean;
	hasKourendElite: boolean;
	kcBank: KCBank;
	gearBank: GearBank;
	slayerInfo: CurrentSlayerInfo;
	slayerUnlocks: SlayerTaskUnlocksEnum[];
	tertiaryItemPercentageChanges: ReturnType<MUser['buildTertiaryItemChanges']>;
	userStats: MUserStats;
	attackStyles: AttackStyles[];
	bitfield: readonly BitField[];
}

function doMonsterTrip(data: newOptions) {
	let {
		mi: monsterID,
		q: quantity,
		usingCannon,
		cannonMulti,
		bob: burstOrBarrage,
		died,
		pkEncounters,
		hasWildySupplies,
		isInWilderness,
		hasEliteCA,
		hasKourendHard,
		kcBank,
		gearBank,
		tertiaryItemPercentageChanges,
		slayerInfo,
		slayerUnlocks,
		hasKourendElite,
		userStats,
		attackStyles,
		duration,
		bitfield
	} = data;
	const currentKC = kcBank.amount(monsterID);
	const updateBank = new UpdateBank();
	const monster = killableMonsters.find(mon => mon.id === monsterID)!;
	const isRevenantMonster = monster.name.includes('Revenant');

	let skulled = false;
	if (isRevenantMonster) skulled = true;

	const messages: string[] = [];

	// Wilderness PK Encounters and PK Deaths, handle remaining anti-pk supplies if any
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
			updateBank.itemLootBank.add(antiPKSupplies);
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
			const hasPrayerLevel = gearBank.skillsAsLevels.prayer >= 25;
			const protectItem = roll(hasWildySupplies ? 300 : 20) ? false : hasPrayerLevel;
			const userGear = { ...deepClone(gearBank.gear.wildy.raw()) };

			const calc = calculateGearLostOnDeathWilderness({
				gear: userGear,
				smited: hasPrayerLevel && !protectItem,
				protectItem: hasPrayerLevel,
				after20wilderness: !!(monster.pkBaseDeathChance && monster.pkBaseDeathChance >= 5),
				skulled
			});

			let reEquipedItems = false;
			if (!gearBank.bank.has(calc.lostItems)) {
				updateBank.gearChanges.wildy = calc.newGear;
			} else {
				updateBank.itemCostBank.add(calc.lostItems);
				reEquipedItems = true;
			}

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
		!gearBank.bank.has('Ancient blood ornament kit') &&
		awakenedMonsters.every(id => Boolean(kcBank.has(id)) || monsterID === id) &&
		isAwakened
	) {
		messages.push('You received an **Ancient blood ornament kit**!');
		updateBank.itemLootBank.add('Ancient blood ornament kit', 1);
	}

	const slayerContext = getSlayerContext({ slayerInfo, monsterID, quantityKilled: quantity, slayerUnlocks });

	const superiorTable = slayerContext.hasSuperiorsUnlocked && monster.superior ? monster.superior : undefined;
	const isInCatacombs = (!usingCannon ? monster.existsInCatacombs ?? undefined : undefined) && !isInWilderness;

	const hasRingOfWealthI = gearBank.gear.wildy.hasEquipped('Ring of wealth (i)') && isInWilderness;
	if (hasRingOfWealthI) {
		messages.push('\nYour clue scroll chance is doubled due to wearing a Ring of Wealth (i).');
	}

	const killOptions: MonsterKillOptions = {
		onSlayerTask: slayerContext.isOnTask,
		slayerMaster: slayerContext.isOnTask ? slayerContext.slayerMaster.osjsEnum : undefined,
		hasSuperiors: superiorTable,
		inCatacombs: isInCatacombs,
		lootTableOptions: {
			tertiaryItemPercentageChanges
		}
	};

	// Calculate superiors and assign loot.
	let newSuperiorCount = 0;

	if (superiorTable && slayerContext.isOnTask) {
		if (!(isInWilderness && monster.name === 'Bloodveld')) {
			let superiorDroprate = 200;
			if (isInWilderness) {
				superiorDroprate *= 0.9;
				messages.push('\n10% more common superiors due to Wilderness Slayer.');
			}
			if (hasEliteCA) {
				superiorDroprate *= 0.75;
				messages.push(`\n${Emoji.CombatAchievements} 25% more common superiors due to Elite CA tier.`);
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
		monster.specialLoot({ loot, ownedItems: gearBank.bank, quantity: finalQuantity });
	}
	if (newSuperiorCount) {
		// Superior loot and totems if in catacombs
		loot.add(superiorTable?.kill(newSuperiorCount));
		if (isInCatacombs) loot.add('Dark totem base', newSuperiorCount);
		if (isInWilderness) loot.add("Larran's key", newSuperiorCount);
	}

	// Hill giant key wildy buff
	if (isInWilderness && monster.name === 'Hill giant') {
		for (let i = 0; i < quantity; i++) {
			if (roll(128)) {
				loot.add('Giant key');
			}
		}
	}

	updateBank.xpBank.add(
		addMonsterXPRaw({
			monsterID,
			quantity,
			duration,
			isOnTask: slayerContext.isOnTask,
			taskQuantity: slayerContext.isOnTask ? slayerContext.quantitySlayed : null,
			minimal: true,
			usingCannon,
			cannonMulti,
			burstOrBarrage,
			superiorCount: newSuperiorCount,
			attackStyles
		})
	);

	if (hasKourendHard) {
		const ashSanctifierResult = ashSanctifierEffect({
			hasKourendElite,
			mutableLootToReceive: loot,
			gearBank,
			bitfield,
			duration
		});
		if (ashSanctifierResult) {
			updateBank.merge(ashSanctifierResult.updateBank);
			messages.push(ashSanctifierResult.message);
		}
	}

	if (newSuperiorCount) {
		updateBank.userStats.slayer_superior_count = {
			increment: newSuperiorCount
		};
	}

	if (slayerContext.isOnTask) {
		if (slayerContext.quantityLeft === 0) {
			messages.push(handleSlayerTaskCompletion({ slayerContext, updateBank, hasKourendElite, userStats }));
		} else {
			messages.push(
				`You killed ${slayerContext.effectiveSlayed}x of your ${
					slayerContext.currentTask?.quantity_remaining
				} remaining kills, you now have ${slayerContext.quantityLeft} kills remaining.`
			);
		}
	}

	if (deaths > 0) {
		messages.push(`You died ${deaths}x times.`);
	}
	if (monster.effect) {
		const effectResult = monster.effect({
			quantity,
			monster,
			loot,
			gearBank
		});
		if (effectResult) {
			if (effectResult.loot) updateBank.itemLootBank.add(effectResult.loot);
			if (effectResult.xpBank) updateBank.xpBank.add(effectResult.xpBank);
			if (effectResult.messages) messages.push(...effectResult.messages);
		}
	}

	kcBank.add(monsterID, quantity);
	const newKC = kcBank.amount(monsterID);

	return {
		slayerContext,
		quantity,
		messages,
		monster,
		newKC,
		updateBank
	};
}

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		const user = await mUserFetch(data.userID);
		const stats = await MUserStats.fromID(data.userID);
		const minigameScores = await user.fetchMinigames();
		const slayerInfo = await getUsersCurrentSlayerInfo(user.id);

		const { slayerContext, monster, quantity, newKC, messages, updateBank } = doMonsterTrip({
			...data,
			tertiaryItemPercentageChanges: user.buildTertiaryItemChanges(
				user.hasEquipped('Ring of wealth (i)'),
				data.isInWilderness,
				slayerInfo.assignedTask?.monster?.id === data.mi
			),
			gearBank: user.gearBank,
			kcBank: safelyMakeKCBank(stats.kcBank),
			hasKourendHard: userhasDiaryTierSync(user, [DiaryID.KourendKebos, 'hard'], { stats, minigameScores })
				.hasDiary,
			hasKourendElite: userhasDiaryTierSync(user, [DiaryID.KourendKebos, 'elite'], { stats, minigameScores })
				.hasDiary,
			slayerInfo,
			slayerUnlocks: user.user.slayer_unlocks,
			userStats: stats,
			attackStyles: user.getAttackStyles(),
			hasEliteCA: user.hasCompletedCATier('elite'),
			bitfield: user.bitfield
		});

		if (slayerContext.isOnTask) {
			await prisma.slayerTask.update({
				where: {
					id: slayerContext.currentTask.id
				},
				data: {
					quantity_remaining: slayerContext.quantityLeft
				}
			});
		}

		// 	if (isInWilderness) {
		// 	await increaseWildEvasionXp(user, duration);
		// }

		// 		await trackLoot({
		// 			totalCost: calc.lostItems,
		// 			id: monster.name,
		// 			type: 'Monster',
		// 			changeType: 'cost',
		// 			users: [
		// 				{
		// 					id: user.id,
		// 					cost: calc.lostItems
		// 				}
		// 			]
		// 		});
		// 		// Track loot (For duration)
		// 		await trackLoot({
		// 			totalLoot: new Bank(),
		// 			id: monster.name,
		// 			type: 'Monster',
		// 			changeType: 'loot',
		// 			duration,
		// 			kc: quantity,
		// 			users: [
		// 				{
		// 					id: user.id,
		// 					loot: new Bank(),
		// 					duration
		// 				}
		// 			]
		// 		});

		// 		const { previousCL, itemsAdded } = await transactItems({
		// 	userID: user.id,
		// 	collectionLog: true,
		// 	itemsToAdd: loot
		// });

		// await trackLoot({
		// 	totalLoot: itemsAdded,
		// 	id: monster.name.toString(),
		// 	type: 'Monster',
		// 	changeType: 'loot',
		// 	kc: quantity,
		// 	duration,
		// 	users: [
		// 		{
		// 			id: user.id,
		// 			loot: itemsAdded,
		// 			duration
		// 		}
		// 	]
		// });
		let str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}. Your ${monster.name} KC is now ${newKC}.`;
		str += `\n\n${messages.join('\n')}`;

		announceLoot({
			user,
			monsterID: monster.id,
			loot: updateBank.itemLootBank,
			notifyDrops: monster.notifyDrops
		});

		// const image =
		// 	itemsAdded.length === 0
		// 		? undefined
		// 		: await makeBankImage({
		// 				bank: itemsAdded,
		// 				title: `Loot From ${quantity} ${monster.name}:`,
		// 				user,
		// 				previousCL
		// 			});

		// return handleTripFinish(user, channelID, str, image?.file.attachment, data, itemsAdded, messages);
	}
};

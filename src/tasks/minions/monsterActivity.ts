import { Time, deepClone, percentChance } from 'e';
import type { MonsterKillOptions } from 'oldschooljs';
import { Bank, EMonster, MonsterSlayerMaster, Monsters } from 'oldschooljs';

import { type BitField, Emoji } from '../../lib/constants';
import { userhasDiaryTierSync } from '../../lib/diaries';
import { trackLoot } from '../../lib/lootTrack';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { type AttackStyles, addMonsterXPRaw } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import { DiaryID, type KillableMonster } from '../../lib/minions/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { type CurrentSlayerInfo, calculateSlayerPoints, getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import type { GearBank } from '../../lib/structures/GearBank';
import { type KCBank, safelyMakeKCBank } from '../../lib/structures/KCBank';
import { MUserStats } from '../../lib/structures/MUserStats';
import { UpdateBank } from '../../lib/structures/UpdateBank';
import type { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { calcPerHour, calculateSimpleMonsterDeathChance, roll } from '../../lib/util';
import { ashSanctifierEffect } from '../../lib/util/ashSanctifier';
import { increaseWildEvasionXp } from '../../lib/util/calcWildyPkChance';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';

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

	let message = `**You've completed ${newStreak} ${isWildyTask ? 'wilderness ' : ''}tasks and received ${points} points; giving you a total of ${slayerContext.slayerPoints + points}; return to a Slayer master.**`;
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
	monster: KillableMonster;
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
	cl: Bank;
}

export function doMonsterTrip(data: newOptions) {
	let {
		monster,
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
	const currentKC = kcBank.amount(monster.id);
	const updateBank = new UpdateBank();

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
				antiPKSupplies.clear();
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
	const wiped = quantity === 0;

	const awakenedMonsters = [
		Monsters.AwakenedDukeSucellus.id,
		Monsters.AwakenedTheLeviathan.id,
		Monsters.AwakenedTheWhisperer.id,
		Monsters.AwakenedVardorvis.id
	];
	const isAwakened = awakenedMonsters.includes(monster.id);
	if (
		quantity > 0 &&
		!gearBank.bank.has('Ancient blood ornament kit') &&
		awakenedMonsters.every(id => kcBank.has(id) || monster.id === id) &&
		isAwakened
	) {
		messages.push('You received an **Ancient blood ornament kit**!');
		updateBank.itemLootBank.add('Ancient blood ornament kit', 1);
	}

	const slayerContext = getSlayerContext({
		slayerInfo,
		monsterID: monster.id,
		quantityKilled: quantity,
		slayerUnlocks
	});

	const superiorTable = slayerContext.hasSuperiorsUnlocked && monster.superior ? monster.superior : undefined;
	const isInCatacombs = (!usingCannon ? (monster.existsInCatacombs ?? undefined) : undefined) && !isInWilderness;

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

	// Loot
	const finalQuantity = quantity - newSuperiorCount;

	const loot = wiped ? new Bank() : monster.table.kill(finalQuantity, killOptions);
	if (!wiped) {
		if (monster.specialLoot) {
			monster.specialLoot({ loot, ownedItems: gearBank.bank, quantity: finalQuantity, cl: data.cl });
		}
		if (newSuperiorCount) {
			loot.add(superiorTable?.kill(newSuperiorCount).set('Brimstone key', 0)); //remove the rng keys, todo: remove drop from superiors in osjs?
			if (isInCatacombs) loot.add('Dark totem base', newSuperiorCount);
			if (isInWilderness) loot.add("Larran's key", newSuperiorCount);
			if (killOptions.slayerMaster === MonsterSlayerMaster.Konar) loot.add('Brimstone key', newSuperiorCount);
		}
		if (isInWilderness && monster.name === 'Hill giant') {
			for (let i = 0; i < quantity; i++) {
				if (roll(128)) {
					loot.add('Giant key');
				}
			}
		}
		updateBank.itemLootBank.add(loot);
		updateBank.xpBank.add(
			addMonsterXPRaw({
				monsterID: monster.id,
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
				updateBank,
				gearBank,
				bitfield,
				duration
			});
			if (ashSanctifierResult) {
				messages.push(ashSanctifierResult.message);
			}
		}
	}

	if (newSuperiorCount) {
		updateBank.userStats.slayer_superior_count = {
			increment: newSuperiorCount
		};
		messages.push(`You slayed ${newSuperiorCount}x superior monsters.`);
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
			gearBank,
			updateBank
		});
		if (effectResult) {
			if (effectResult.loot) updateBank.itemLootBank.add(effectResult.loot);
			if (effectResult.xpBank) updateBank.xpBank.add(effectResult.xpBank);
			if (effectResult.messages) messages.push(...effectResult.messages);
		}
	}

	if (!wiped) updateBank.kcBank.add(monster.id, quantity);
	const newKC = kcBank.amount(monster.id) + quantity;

	return {
		slayerContext,
		quantity,
		messages,
		newKC,
		updateBank,
		monster
	};
}

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		const { duration } = data;
		const user = await mUserFetch(data.userID);
		const stats = await MUserStats.fromID(data.userID);
		const minigameScores = await user.fetchMinigames();
		const slayerInfo = await getUsersCurrentSlayerInfo(user.id);
		const monster = killableMonsters.find(mon => mon.id === data.mi)!;
		const attackStyles = data.attackStyles ?? user.getAttackStyles();
		const { slayerContext, quantity, newKC, messages, updateBank } = doMonsterTrip({
			...data,
			monster,
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
			attackStyles,
			hasEliteCA: user.hasCompletedCATier('elite'),
			bitfield: user.bitfield,
			cl: user.cl
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

		if (data.isInWilderness) {
			await increaseWildEvasionXp(user, duration);
		}

		await trackLoot({
			totalCost: updateBank.itemCostBank,
			id: monster.name,
			type: 'Monster',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: updateBank.itemCostBank
				}
			]
		});

		await trackLoot({
			totalLoot: updateBank.itemLootBank,
			id: monster.name.toString(),
			type: 'Monster',
			changeType: 'loot',
			kc: quantity,
			duration,
			users: [
				{
					id: user.id,
					loot: updateBank.itemLootBank,
					duration
				}
			]
		});

		const resultOrError = await updateBank.transact(user, { isInWilderness: data.isInWilderness });
		if (typeof resultOrError === 'string') {
			return resultOrError;
		}
		const { itemTransactionResult, rawResults } = resultOrError;
		messages.push(...rawResults.filter(r => typeof r === 'string'));
		const str = `${user}, ${user.minionName} finished killing ${quantity} ${monster.name} (${calcPerHour(data.q, data.duration).toFixed(1)}/hr), you now have ${newKC} KC.`;

		let image = undefined;

		if (itemTransactionResult && itemTransactionResult.itemsAdded.length > 0) {
			announceLoot({
				user,
				monsterID: monster.id,
				loot: itemTransactionResult.itemsAdded,
				notifyDrops: monster.notifyDrops
			});
			image = await makeBankImage({
				bank: itemTransactionResult.itemsAdded,
				title: `Loot From ${quantity} ${monster.name}:`,
				user,
				previousCL: itemTransactionResult?.previousCL
			});
		}

		return handleTripFinish(
			user,
			data.channelID,
			str,
			image?.file.attachment,
			data,
			itemTransactionResult?.itemsAdded ?? null,
			messages
		);
	}
};

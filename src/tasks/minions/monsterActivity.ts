import type { Prisma } from '@prisma/client';
import {
	Time,
	calcWhatPercent,
	deepClone,
	increaseNumByPercent,
	percentChance,
	randArrItem,
	reduceNumByPercent,
	roll,
	sumArr
} from 'e';
import type { MonsterKillOptions } from 'oldschooljs';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { BitField, Emoji } from '../../lib/constants';
import { slayerMaskHelms } from '../../lib/data/slayerMaskHelms';
import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';
import { trackLoot } from '../../lib/lootTrack';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { addMonsterXP } from '../../lib/minions/functions';
import announceLoot from '../../lib/minions/functions/announceLoot';
import type { KillableMonster } from '../../lib/minions/types';

import { bones } from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../lib/slayer/slayerUnlocks';
import { calculateSlayerPoints, isOnSlayerTask } from '../../lib/slayer/slayerUtil';
import type { MonsterActivityTaskOptions } from '../../lib/types/minions';
import { assert, calculateSimpleMonsterDeathChance, clAdjustedDroprate, hasSkillReqs } from '../../lib/util';
import { ashSanctifierEffect } from '../../lib/util/ashSanctifier';
import calculateGearLostOnDeathWilderness from '../../lib/util/calculateGearLostOnDeathWilderness';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { sendToChannelID } from '../../lib/util/webhook';
import { trackClientBankStats, userStatsBankUpdate, userStatsUpdate } from '../../mahoji/mahojiSettings';

async function bonecrusherEffect(user: MUser, loot: Bank, duration: number, messages: string[]) {
	if (!user.hasEquippedOrInBank(['Gorajan bonecrusher', 'Superior bonecrusher'], 'one')) return;
	if (user.bitfield.includes(BitField.DisabledGorajanBoneCrusher)) return;
	let hasSuperior = user.owns('Superior bonecrusher');

	let totalXP = 0;
	for (const bone of bones) {
		const amount = loot.amount(bone.inputId);
		if (amount > 0) {
			totalXP += bone.xp * amount * 4;
			loot.remove(bone.inputId, amount);
		}
	}

	const durationForCost = totalXP * 16.8;
	let boostMsg: string | null = null;
	if (hasSuperior && durationForCost > Time.Minute) {
		const t = await inventionItemBoost({
			user,
			inventionID: InventionID.SuperiorBonecrusher,
			duration: durationForCost
		});
		if (!t.success) {
			hasSuperior = false;
		} else {
			totalXP = increaseNumByPercent(totalXP, inventionBoosts.superiorBonecrusher.xpBoostPercent);
			boostMsg = t.messages;
		}
	}

	totalXP *= 5;
	userStatsUpdate(user.id, {
		bonecrusher_prayer_xp: {
			increment: Math.floor(totalXP)
		}
	});
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Prayer,
		amount: totalXP,
		duration,
		minimal: true,
		multiplier: false
	});
	messages.push(
		`${xpStr} Prayer XP ${
			hasSuperior
				? `+${inventionBoosts.superiorBonecrusher.xpBoostPercent}% more from Superior bonecrusher${
						boostMsg ? ` (${boostMsg})` : ''
					}`
				: ' from Gorajan bonecrusher'
		}`
	);
}

const hideLeatherMap = [
	[getOSItem('Green dragonhide'), getOSItem('Green dragon leather')],
	[getOSItem('Blue dragonhide'), getOSItem('Blue dragon leather')],
	[getOSItem('Red dragonhide'), getOSItem('Red dragon leather')],
	[getOSItem('Black dragonhide'), getOSItem('Black dragon leather')],
	[getOSItem('Royal dragonhide'), getOSItem('Royal dragon leather')]
] as const;

async function portableTannerEffect(user: MUser, loot: Bank, duration: number, messages: string[]) {
	if (!user.owns('Portable tanner')) return;
	const boostRes = await inventionItemBoost({
		user,
		inventionID: InventionID.PortableTanner,
		duration
	});
	if (!boostRes.success) return;
	let triggered = false;
	const toAdd = new Bank();
	for (const [hide, leather] of hideLeatherMap) {
		const qty = loot.amount(hide.id);
		if (qty > 0) {
			triggered = true;
			loot.remove(hide.id, qty);
			toAdd.add(leather.id, qty);
		}
	}
	loot.add(toAdd);
	trackClientBankStats('portable_tanner_loot', toAdd);
	userStatsBankUpdate(user.id, 'portable_tanner_bank', toAdd);
	if (!triggered) return;
	messages.push(`Portable Tanner turned the hides into leathers (${boostRes.messages})`);
}

export async function clueUpgraderEffect(user: MUser, loot: Bank, messages: string[], type: 'pvm' | 'pickpocketing') {
	if (!user.owns('Clue upgrader')) return false;
	const upgradedClues = new Bank();
	const removeBank = new Bank();
	let durationForCost = 0;

	const fn = type === 'pvm' ? inventionBoosts.clueUpgrader.chance : inventionBoosts.clueUpgrader.pickPocketChance;
	for (let i = 0; i < 5; i++) {
		const clueTier = ClueTiers[i];
		if (!loot.has(clueTier.scrollID)) continue;
		for (let t = 0; t < loot.amount(clueTier.scrollID); t++) {
			if (percentChance(fn(clueTier))) {
				removeBank.add(clueTier.scrollID);
				upgradedClues.add(ClueTiers[i + 1].scrollID);
				durationForCost += inventionBoosts.clueUpgrader.durationCalc(clueTier);
			}
		}
	}
	if (upgradedClues.length === 0) return false;
	const boostRes = await inventionItemBoost({
		user,
		inventionID: InventionID.ClueUpgrader,
		duration: durationForCost
	});
	if (!boostRes.success) return false;
	trackClientBankStats('clue_upgrader_loot', upgradedClues);
	userStatsBankUpdate(user.id, 'clue_upgrader_bank', upgradedClues);
	loot.add(upgradedClues);
	assert(loot.has(removeBank));
	loot.remove(removeBank);
	const totalCluesUpgraded = sumArr(upgradedClues.items().map(i => i[1]));
	messages.push(`<:Clue_upgrader:986830303001722880> Upgraded ${totalCluesUpgraded} clues (${boostRes.messages})`);
}

export const monsterTask: MinionTask = {
	type: 'MonsterKilling',
	async run(data: MonsterActivityTaskOptions) {
		let {
			mi: monsterID,
			userID,
			channelID,
			q: quantity,
			duration,
			usingCannon,
			cannonMulti,
			bob: burstOrBarrage,
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
		if (monster.name === 'Koschei the deathless' && !roll(5000)) {
			sendToChannelID(channelID, {
				content: `${user}, ${user.minionName} failed to defeat Koschei the deathless.`
			});
		}
		const fullMonster = Monsters.get(monsterID);

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
					after20wilderness: !!(monster.pkBaseDeathChance && monster.pkBaseDeathChance >= 5),
					skulled
				});

				let reEquipedItems = false;
				const itemsToReplace = new Bank().add(calc.lostItems).add(calc.gearThatBroke);
				if (!user.bank.has(itemsToReplace)) {
					await user.update({
						gear_wildy: calc.newGear as Prisma.InputJsonObject
					});
				} else {
					await user.transactItems({ itemsToRemove: itemsToReplace });
					reEquipedItems = true;
				}

				if (calc.gearToRefund.length > 0) {
					await user.addItemsToBank({ items: calc.gearToRefund, collectionLog: false });
					messages.push(`Your ${calc.gearThatBroke} broke, turning into ${calc.gearToRefund} in your bank.`);
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

		// Abyssal set bonuses -- grants the user a few extra kills
		let boostedQuantity = quantity;
		let oriBoost = false;
		if (user.usingPet('Ori')) {
			oriBoost = true;
			if (duration > Time.Minute * 5) {
				// Original boost for 5+ minute task:
				boostedQuantity = Math.ceil(increaseNumByPercent(quantity, 25));
			} else {
				// 25% chance at extra kill otherwise:
				for (let i = 0; i < quantity; i++) {
					if (roll(4)) boostedQuantity++;
				}
			}
		}

		const isOnTaskResult = await isOnSlayerTask({ user, monsterID, quantityKilled: quantity });

		const superiorTable = isOnTaskResult.hasSuperiorsUnlocked && monster.superior ? monster.superior : undefined;
		const isInCatacombs = (!usingCannon ? monster.existsInCatacombs ?? undefined : undefined) && !isInWilderness;

		const hasRingOfWealthI = user.gear.wildy.hasEquipped('Ring of wealth (i)') && isInWilderness;
		if (hasRingOfWealthI) {
			messages.push('\nYour clue scroll chance is doubled due to wearing a Ring of Wealth (i).');
		}

		const killOptions: MonsterKillOptions = {
			onSlayerTask: isOnTaskResult.isOnTask,
			slayerMaster: isOnTaskResult.isOnTask ? isOnTaskResult.slayerMaster.osjsEnum : undefined,
			hasSuperiors: superiorTable,
			inCatacombs: isInCatacombs,
			lootTableOptions: {
				tertiaryItemPercentageChanges: user.buildTertiaryItemChanges(
					hasRingOfWealthI,
					isInWilderness,
					isOnTaskResult.isOnTask
				)
			}
		};

		const loot = (monster as KillableMonster).table.kill(boostedQuantity, killOptions);

		if (isDoubleLootActive(duration)) loot.multiply(2);

		// Calculate superiors and assign loot.
		let newSuperiorCount = 0;

		if (superiorTable && isOnTaskResult.isOnTask) {
			if (!(isInWilderness && monster.name === 'Bloodveld')) {
				let superiorDroprate = 200;
				if (isInWilderness) {
					superiorDroprate *= 0.9;
					messages.push('\n10% more common superiors due to Wilderness Slayer.');
				}
				if (user.hasCompletedCATier('elite')) {
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

		const masterCapeRolls = user.hasEquippedOrInBank('Slayer master cape') ? newSuperiorCount : 0;
		newSuperiorCount += masterCapeRolls;

		// Regular loot
		if (monster.specialLoot) {
			monster.specialLoot({ loot, ownedItems: user.allItemsOwned, quantity: boostedQuantity, cl: user.cl });
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

		const xpRes: string[] = [];
		if (quantity >= 1) {
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
		}

		if (hasKourendHard) await ashSanctifierEffect(user, loot, duration, xpRes);

		const superiorMessage = newSuperiorCount ? `, including **${newSuperiorCount} superiors**` : '';
		const sorryMessages = [
			'They apologized for dying so much.',
			"They're sorry for dying so much.",
			"They're sorry.",
			'They said they will do better.'
		];
		let str =
			quantity === 0
				? `${user}, ${user.minionName} died in ALL their kill attempts!${
						roll(10) ? ` ${randArrItem(sorryMessages)}` : ''
					}`
				: `${user}, ${user.minionName} finished killing ${quantity} ${monster.name}${superiorMessage}.` +
					` Your ${monster.name} KC is now ${newKC}.\n${xpRes}\n`;

		if (masterCapeRolls > 0) {
			messages.push(`${Emoji.SlayerMasterCape} You received ${masterCapeRolls}x bonus superior rolls`);
		}

		if (monster.id === Monsters.Vorkath.id && roll(6000)) {
			loot.add(23_941);
		}

		let gotKlik = false;
		const minutes = Math.ceil(duration / Time.Minute);
		if (fullMonster?.data.attributes.includes(MonsterAttribute.Dragon)) {
			const dropRate = clAdjustedDroprate(user, 'Klik', 8500, 1.5);
			for (let i = 0; i < minutes; i++) {
				if (roll(dropRate)) {
					gotKlik = true;
					loot.add('Klik');
					break;
				}
			}
		}

		if (monster.id === 290) {
			for (let i = 0; i < minutes; i++) {
				if (roll(6000)) {
					loot.add('Dwarven ore');
					break;
				}
			}
		}

		let gotBrock = false;
		if (monster.name.toLowerCase() === 'zulrah') {
			for (let i = 0; i < minutes; i++) {
				if (roll(5500)) {
					gotBrock = true;
					loot.add('Brock');
					break;
				}
			}
		}

		if (gotBrock) {
			messages.push(
				'<:brock:787310793183854594> On the way to Zulrah, you found a Badger that wants to join you.'
			);
		}

		if (gotKlik) {
			messages.push(
				'<:klik:749945070932721676> A small fairy dragon appears! Klik joins you on your adventures.'
			);
		}

		if (oriBoost) {
			messages.push('Ori has used the abyss to transmute you +25% bonus loot!');
		}
		if (isDoubleLootActive(duration)) {
			messages.push('**Double Loot!**');
		}

		announceLoot({ user, monsterID: monster.id, loot, notifyDrops: monster.notifyDrops });

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

		if (
			monster.id === Monsters.Unicorn.id &&
			user.hasEquipped('Iron dagger') &&
			!user.hasEquippedOrInBank(['Clue hunter cloak'])
		) {
			loot.add('Clue hunter cloak');
			loot.add('Clue hunter boots');
		}

		await bonecrusherEffect(user, loot, duration, messages);
		await portableTannerEffect(user, loot, duration, messages);
		await clueUpgraderEffect(user, loot, messages, 'pvm');

		let thisTripFinishesTask = false;

		if (isOnTaskResult.isOnTask) {
			const { quantitySlayed } = isOnTaskResult;
			const effectiveSlayed =
				monsterID === Monsters.KrilTsutsaroth.id &&
				isOnTaskResult.currentTask?.monster_id !== Monsters.KrilTsutsaroth.id
					? quantitySlayed! * 2
					: monsterID === Monsters.Kreearra.id &&
							isOnTaskResult.currentTask.monster_id !== Monsters.Kreearra.id
						? quantitySlayed * 4
						: monsterID === Monsters.GrotesqueGuardians.id &&
								user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
							? quantitySlayed * 2
							: quantitySlayed;

			/**
			 * Slayer masks/helms
			 */
			if (effectiveSlayed > 0 && user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.Maskuerade)) {
				const bankToAdd = new Bank().add(monsterID, effectiveSlayed);
				const maskHelmForThisMonster = slayerMaskHelms.find(i => i.monsters.includes(monsterID));
				const matchingMaskOrHelm =
					maskHelmForThisMonster &&
					user.hasEquippedOrInBank([maskHelmForThisMonster.mask.id, maskHelmForThisMonster.helm.id])
						? maskHelmForThisMonster
						: null;

				const currentUserStats = await user.fetchStats({ on_task_with_mask_monster_scores: true });
				const oldMaskScores = new Bank(currentUserStats.on_task_with_mask_monster_scores as ItemBank);
				const newMaskScores = oldMaskScores.clone().add(bankToAdd);
				if (maskHelmForThisMonster && !user.owns(maskHelmForThisMonster.mask.id, { includeGear: true })) {
					for (let i = 0; i < effectiveSlayed; i++) {
						if (roll(maskHelmForThisMonster.maskDropRate)) {
							loot.add(maskHelmForThisMonster.mask.id);
							break;
						}
					}
				}

				const currentStats = await user.fetchStats({ on_task_monster_scores: true });
				await userStatsUpdate(user.id, {
					on_task_monster_scores: new Bank(currentStats.on_task_monster_scores as ItemBank).add(bankToAdd)
						.bank,
					on_task_with_mask_monster_scores: matchingMaskOrHelm ? newMaskScores.bank : undefined
				});
			}

			const quantityLeft = Math.max(0, isOnTaskResult.currentTask!.quantity_remaining - effectiveSlayed);
			const isUsingKrystilia = isOnTaskResult.slayerMaster.id === 8;

			thisTripFinishesTask = quantityLeft === 0;
			if (thisTripFinishesTask && isUsingKrystilia) {
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
				if (isOnTaskResult.assignedTask.isBoss) {
					str += ` ${await user.addXP({ skillName: SkillsEnum.Slayer, amount: 5000, minimal: true })}`;
					str += ' for completing your boss task.';
				}
			} else if (thisTripFinishesTask) {
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
					isOnTaskResult.currentTask?.quantity_remaining
				} remaining kills, you now have ${quantityLeft} kills remaining.`;
			}

			if (thisTripFinishesTask) {
				let mysteryBoxChance = 25;
				if (isOnTaskResult.slayerMaster.id >= 4) {
					mysteryBoxChance -= 20;
				}

				mysteryBoxChance = reduceNumByPercent(
					mysteryBoxChance,
					calcWhatPercent(monster.timeToFinish, Time.Minute * 15) / 3
				);

				mysteryBoxChance = Math.floor(mysteryBoxChance);
				mysteryBoxChance = Math.max(1, mysteryBoxChance);

				if (roll(mysteryBoxChance)) {
					loot.add(MysteryBoxes.roll());
				}
			}

			await prisma.slayerTask.update({
				where: {
					id: isOnTaskResult.currentTask?.id
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

		return handleTripFinish(user, channelID, str, image?.file.attachment, data, itemsAdded, messages);
	}
};

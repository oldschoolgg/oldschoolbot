import type { ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import { bold } from 'discord.js';
import {
	Time,
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	objectKeys,
	reduceNumByPercent,
	round,
	sumArr,
	uniqueArr
} from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { colosseumCommand } from '../../../../lib/colosseum';
import type { PvMMethod } from '../../../../lib/constants';
import { BitField, PeakTier } from '../../../../lib/constants';
import { Eatables } from '../../../../lib/data/eatables';
import { getSimilarItems } from '../../../../lib/data/similarItems';
import { checkUserCanUseDegradeableItem, degradeItem, degradeablePvmBoostItems } from '../../../../lib/degradeableItems';
import type { GearSetupType } from '../../../../lib/gear/types';
import { trackLoot } from '../../../../lib/lootTrack';
import {
	SlayerActivityConstants,
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonBanks,
	cannonMultiConsumables,
	cannonSingleConsumables,
	iceBarrageConsumables,
	iceBurstConsumables
} from '../../../../lib/minions/data/combatConstants';
import { wildyKillableMonsters } from '../../../../lib/minions/data/killableMonsters/bosses/wildy';
import { revenantMonsters } from '../../../../lib/minions/data/killableMonsters/revs';
import { quests } from '../../../../lib/minions/data/quests';
import type { AttackStyles } from '../../../../lib/minions/functions';
import { calculateMonsterFood } from '../../../../lib/minions/functions';
import reducedTimeFromKC from '../../../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../../../lib/minions/functions/removeFoodFromUser';
import type { Consumable, KillableMonster } from '../../../../lib/minions/types';
import { calcPOHBoosts } from '../../../../lib/poh';
import { SkillsEnum } from '../../../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../../../lib/slayer/slayerUnlocks';
import { getUsersCurrentSlayerInfo } from '../../../../lib/slayer/slayerUtil';
import type { Peak } from '../../../../lib/tickers';
import type { MonsterActivityTaskOptions } from '../../../../lib/types/minions';
import {
	checkRangeGearWeapon,
	convertAttackStyleToGearSetup,
	convertPvmStylesToGearSetup,
	formatDuration,
	formatItemCosts,
	isWeekend,
	itemNameFromID,
	randomVariation,
	stringMatches
} from '../../../../lib/util';
import addSubTaskToActivityTask from '../../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../../lib/util/calcMaxTripLength';
import { calcWildyPKChance, increaseWildEvasionXp } from '../../../../lib/util/calcWildyPkChance';
import { calculateTripConsumableCost } from '../../../../lib/util/calculateTripConsumableCost';
import findMonster from '../../../../lib/util/findMonster';
import { handleMahojiConfirmation } from '../../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../../lib/util/updateBankSetting';
import { hasMonsterRequirements, resolveAvailableItemBoosts } from '../../../mahojiSettings';
import { nexCommand } from '../nexCommand';
import { nightmareCommand } from '../nightmareCommand';
import { getPOH } from '../pohCommand';
import { temporossCommand } from '../temporossCommand';
import { wintertodtCommand } from '../wintertodtCommand';
import { zalcanoCommand } from '../zalcanoCommand';
import type { SkillsRequired } from '../../../../lib/types';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

function formatMissingItems(consumables: Consumable[], timeToFinish: number) {
	const str = [];

	for (const consumable of consumables) {
		str.push(formatItemCosts(consumable, timeToFinish));
	}

	return str.join(', ');
}

const { floor } = Math;

function applySkillBoost(skillsAsLevels:SkillsRequired, duration: number, styles: AttackStyles[]): [number, string] {
	const skillTotal = sumArr(styles.map(s => skillsAsLevels[s]));

	let newDuration = duration;
	let str = '';
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);

	if (percent < 50) {
		percent = 50 - percent;
		newDuration = increaseNumByPercent(newDuration, percent);
		str = `-${percent.toFixed(2)}% for low stats`;
	} else {
		percent = Math.min(15, percent / 6.5);
		newDuration = reduceNumByPercent(newDuration, percent);
		str = `${percent.toFixed(2)}% for stats`;
	}

	return [newDuration, str];
}

function speedCalculations({monster, monsterKC,attackStyles}: {attackStyles: AttackStyles[],monster: KillableMonster, monsterKC: number}){
	const [timeToFinish, percentReduced] = reducedTimeFromKC(monster, monsterKC);
		const [newTime, skillBoostMsg] = applySkillBoost(user, timeToFinish, attackStyles);

		

	timeToFinish = newTime;
	boosts.push(skillBoostMsg);

	if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

	if (monster.pohBoosts) {
		const [boostPercent, messages] = calcPOHBoosts(await getPOH(user.id), monster.pohBoosts);
		if (boostPercent > 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			boosts.push(messages.join(' + '));
		}
	}

	for (const [itemID, boostAmount] of Object.entries(resolveAvailableItemBoosts(user, monster, isInWilderness))) {
		timeToFinish *= (100 - boostAmount) / 100;
		boosts.push(`${boostAmount}% for ${itemNameFromID(Number.parseInt(itemID))}`);
	}

}


export async function minionKillCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	channelID: string,
	name: string,
	quantity: number | undefined,
	method: PvMMethod | PvMMethod[] | undefined,
	wilderness: boolean | undefined,
	solo: boolean | undefined
): Promise<string | InteractionReplyOptions> {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const inputQuantity = quantity;
	const { minionName } = user;
	const wildyGear = user.gear.wildy;

	if (!name) return invalidMonsterMsg;

	if (stringMatches(name, 'colosseum')) return colosseumCommand(user, channelID);
	if (stringMatches(name, 'nex')) return nexCommand(interaction, user, channelID, solo);
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID, quantity);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, quantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name, quantity);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID, quantity);

	let monster = findMonster(name);
	let revenants = false;

	const matchedRevenantMonster = revenantMonsters.find(monster =>
		monster.aliases.some(alias => stringMatches(alias, name))
	);
	if (matchedRevenantMonster) {
		monster = matchedRevenantMonster;
		revenants = true;
	}

	if (!monster) return invalidMonsterMsg;
		
	const [hasReqs, reason] = await hasMonsterRequirements(user, monster);
	if (!hasReqs) {
		return typeof reason === 'string' ? reason : "You don't have the requirements to fight this monster";
	}
	
	newMinionKillCommand({
		attackStyle: user.user.attack_style,
		gear: user.gear,
		currentSlayerTask: await getUsersCurrentSlayerInfo(user.id),
		monster,
		isTryingToUseWildy: wilderness ?? false,
		monsterKC: await user.getKC(monster.id),
		inputPVMMethod: method,
	});



	const monsterHP = osjsMon?.data.hitpoints ?? 100;

	// Black mask and salve don't stack.
	const oneSixthBoost = 16.67;
	const blackMaskBoost = 0;
	const blackMaskBoostMsg = '';
	const salveAmuletBoost = 0;
	const salveAmuletBoostMsg = '';
	const virtusBoost = 0;
	const virtusBoostMsg = '';

	const dragonBoost = 0;
	const dragonBoostMsg = '';
	const revBoost = 0;
	const revBoostMsg = '';

	const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	const isDragon = osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon);



	if (isDragon && monster.name.toLowerCase() !== 'vorkath') {
		applyDragonBoost();
	}

	if (isOnTask) {
		applyBlackMaskBoost();
	}

	if (isUndead) {
		calculateSalveAmuletBoost();
	}

	// Kodai boost
	if (style === 'mage' && (combatMethods.includes('barrage') || combatMethods.includes('burst'))) {
		const kodaiEquipped = isInWilderness
			? wildyGear.hasEquipped('Kodai wand')
			: user.gear.mage.hasEquipped('Kodai wand');

		if (kodaiEquipped) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			boosts.push('15% boost for Kodai wand');
		}
	}

	// Only choose greater boost:
	if (salveAmuletBoost || blackMaskBoost) {
		if (salveAmuletBoost > blackMaskBoost) {
			timeToFinish = reduceNumByPercent(timeToFinish, salveAmuletBoost);
			boosts.push(salveAmuletBoostMsg);
		} else {
			timeToFinish = reduceNumByPercent(timeToFinish, blackMaskBoost);
			boosts.push(blackMaskBoostMsg);
		}
	}

	// Only choose greater boost:
	if (dragonBoost || revBoost) {
		if (revBoost > dragonBoost) {
			timeToFinish = reduceNumByPercent(timeToFinish, revBoost);
			boosts.push(revBoostMsg);
		} else {
			timeToFinish = reduceNumByPercent(timeToFinish, dragonBoost);
			boosts.push(dragonBoostMsg);
		}
	}

	if (revenants) {
		timeToFinish = reduceNumByPercent(timeToFinish, revGearPercent / 4);
		boosts.push(`${(revGearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${key}`);

		const specialWeapon = revSpecialWeapons[style];
		if (wildyGear.hasEquipped(specialWeapon.name)) {
			timeToFinish = reduceNumByPercent(timeToFinish, 35);
			boosts.push(`${35}% for ${specialWeapon.name}`);
		}
	}

	// Initialize consumable costs before any are calculated.
	const consumableCosts: Consumable[] = [];

	// Calculate Cannon and Barrage boosts + costs:
	let usingCannon = false;
	let cannonMulti = false;
	let chinning = false;
	let burstOrBarrage = 0;
	const hasCannon = cannonBanks.some(i => user.owns(i));

	// Check for cannon
	if (combatMethods.includes('cannon') && !hasCannon) {
		return "You don't own a Dwarf multicannon, so how could you use one?";
	}

	// Check for stats
	if (combatMethods.includes('barrage') && user.skillLevel(SkillsEnum.Magic) < 94) {
		return `You need 94 Magic to use Ice Barrage. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	if (combatMethods.includes('burst') && user.skillLevel(SkillsEnum.Magic) < 70) {
		return `You need 70 Magic to use Ice Burst. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	if (combatMethods.includes('chinning') && user.skillLevel(SkillsEnum.Ranged) < 65) {
		return `You need 65 Ranged to use Chinning method. You have ${user.skillLevel(SkillsEnum.Ranged)}`;
	}

	// Wildy monster cannon checks
	if (isInWilderness === true && combatMethods.includes('cannon')) {
		if (monster.id === Monsters.HillGiant.id || monster.id === Monsters.MossGiant.id) {
			usingCannon = isInWilderness;
		}

		if (monster.id === Monsters.Spider.id || monster.id === Monsters.Scorpion.id) {
			usingCannon = isInWilderness;
			cannonMulti = isInWilderness;
		}

		if (monster.wildySlayerCave) {
			usingCannon = isInWilderness;
			cannonMulti = isInWilderness;
			if (monster.id === Monsters.AbyssalDemon.id && !isOnTask) {
				usingCannon = false;
				cannonMulti = false;
			}
		}

		// wildy bosses
		for (const wildyMonster of wildyKillableMonsters) {
			if (monster.id === wildyMonster.id) {
				usingCannon = false;
				cannonMulti = false;
				break;
			}
		}

		// revenants
		for (const revenant of revenantMonsters) {
			if (monster.id === revenant.id) {
				usingCannon = false;
				cannonMulti = false;
				break;
			}
		}
	}

	// Burst/barrage check with wilderness conditions
	if ((combatMethods.includes('burst') || combatMethods.includes('barrage')) && !monster?.canBarrage) {
		if (jelly) {
			if (!isInWilderness) {
				return `${monster.name} can only be barraged or burst in the wilderness.`;
			}
		} else return `${monster?.name} cannot be barraged or burst.`;
	}

	if (!usingCannon) {
		if (combatMethods.includes('cannon') && !monster?.canCannon) {
			combatMethods = combatMethods.filter(method => method !== 'cannon');
		}
	}

	if (
		combatMethods.includes('barrage') &&
		attackStyles.includes(SkillsEnum.Magic) &&
		(monster?.canBarrage || wildyBurst)
	) {
		consumableCosts.push(iceBarrageConsumables);
		calculateVirtusBoost();
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBarrage + virtusBoost);
		boosts.push(`${boostIceBarrage + virtusBoost}% for Ice Barrage${virtusBoostMsg}`);
		burstOrBarrage = SlayerActivityConstants.IceBarrage;
	} else if (
		combatMethods.includes('burst') &&
		attackStyles.includes(SkillsEnum.Magic) &&
		(monster?.canBarrage || wildyBurst)
	) {
		consumableCosts.push(iceBurstConsumables);
		calculateVirtusBoost();
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBurst + virtusBoost);
		boosts.push(`${boostIceBurst + virtusBoost}% for Ice Burst${virtusBoostMsg}`);
		burstOrBarrage = SlayerActivityConstants.IceBurst;
	}
	if ((combatMethods.includes('cannon') && hasCannon && monster?.cannonMulti) || cannonMulti) {
		usingCannon = true;
		cannonMulti = true;
		consumableCosts.push(cannonMultiConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostCannonMulti);
		boosts.push(`${boostCannonMulti}% for Cannon in multi`);
	} else if ((combatMethods.includes('cannon') && hasCannon && monster?.canCannon) || usingCannon) {
		usingCannon = true;
		consumableCosts.push(cannonSingleConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostCannon);
		boosts.push(`${boostCannon}% for Cannon in singles`);
	} else if (combatMethods.includes('chinning') && attackStyles.includes(SkillsEnum.Ranged) && monster?.canChinning) {
		chinning = true;
		// Check what Chinchompa to use
		const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
		let chinchompa = 'Black chinchompa';
		for (const chin of chinchompas) {
			if (user.owns(chin) && user.bank.amount(chin) > 5000) {
				chinchompa = chin;
				break;
			}
		}
		const chinBoostRapid = chinchompa === 'Chinchompa' ? 73 : chinchompa === 'Red chinchompa' ? 76 : 82;
		const chinBoostLongRanged = chinchompa === 'Chinchompa' ? 63 : chinchompa === 'Red chinchompa' ? 69 : 77;
		const chinningConsumables: Consumable = {
			itemCost: new Bank().add(chinchompa, 1),
			qtyPerMinute: attackStyles.includes(SkillsEnum.Defence) ? 24 : 33
		};
		if (attackStyles.includes(SkillsEnum.Defence)) {
			timeToFinish = reduceNumByPercent(timeToFinish, chinBoostLongRanged);
			boosts.push(`${chinBoostLongRanged}% for ${chinchompa} Longrange`);
		} else {
			timeToFinish = reduceNumByPercent(timeToFinish, chinBoostRapid);
			boosts.push(`${chinBoostRapid}% for ${chinchompa} Rapid`);
		}
		consumableCosts.push(chinningConsumables);
	}

	const maxTripLength = calcMaxTripLength(user, 'MonsterKilling');

	/**
	 *
	 * Degradeable Items
	 *
	 */
	const degItemBeingUsed = [];
	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => user.gear[set.gearSetup].hasEquipped(item.itemID));
			if (set.required && !equippedInThisSet) {
				return `You need one of these items equipped in your ${set.gearSetup} setup to kill ${
					monster.name
				}: ${set.items
					.map(i => i.itemID)
					.map(itemNameFromID)
					.join(', ')}.`;
			}
			if (equippedInThisSet) {
				const degItem = degradeablePvmBoostItems.find(i => i.item.id === equippedInThisSet.itemID)!;
				boosts.push(`${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`);
				timeToFinish = reduceNumByPercent(timeToFinish, equippedInThisSet.boostPercent);
				degItemBeingUsed.push(degItem);
			}
		}
	} else {
		for (const degItem of degradeablePvmBoostItems) {
			const isUsing = convertPvmStylesToGearSetup(attackStyles).includes(degItem.attackStyle);
			const gearCheck = isInWilderness
				? user.gear.wildy.hasEquipped(degItem.item.id)
				: user.gear[degItem.attackStyle].hasEquipped(degItem.item.id);

			if (isUsing && gearCheck) {
				// We assume they have enough charges, add the boost, and degrade at the end to avoid doing it twice.
				degItemBeingUsed.push(degItem);
			}
		}
		for (const degItem of degItemBeingUsed) {
			boosts.push(`${degItem.boost}% for ${degItem.item.name}`);
			timeToFinish = reduceNumByPercent(timeToFinish, degItem.boost);
		}
	}

	if (monster.equippedItemBoosts) {
		for (const boostSet of monster.equippedItemBoosts) {
			const equippedInThisSet = boostSet.items.find(item =>
				user.gear[boostSet.gearSetup].hasEquipped(item.itemID)
			);
			if (equippedInThisSet) {
				boosts.push(`${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`);
				timeToFinish = reduceNumByPercent(timeToFinish, equippedInThisSet.boostPercent);
			}
		}
	}

	// If no quantity provided, set it to the max.
	if (!quantity) {
		if ([Monsters.Skotizo.id].includes(monster.id)) {
			quantity = 1;
		} else {
			quantity = floor(maxTripLength / timeToFinish);
		}
	}

	if (isOnTask) {
		let effectiveQtyRemaining = usersTask.currentTask?.quantity_remaining;
		if (
			monster.id === Monsters.KrilTsutsaroth.id &&
			usersTask.currentTask?.monster_id !== Monsters.KrilTsutsaroth.id
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		} else if (monster.id === Monsters.Kreearra.id && usersTask.currentTask?.monster_id !== Monsters.Kreearra.id) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 4);
		} else if (
			monster.id === Monsters.GrotesqueGuardians.id &&
			user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		}
		quantity = Math.min(quantity, effectiveQtyRemaining);
	}

	quantity = Math.max(1, quantity);
	let duration = timeToFinish * quantity;
	if (quantity > 1 && duration > maxTripLength) {
		return `${minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${monster.name} is ${floor(
			maxTripLength / timeToFinish
		)}.`;
	}

	const totalCost = new Bank();
	const lootToRemove = new Bank();
	let pvmCost = false;

	if (monster.itemCost) {
		consumableCosts.push(monster.itemCost);
	}

	const infiniteWaterRunes = user.hasEquipped(getSimilarItems(itemID('Staff of water')), false);
	const perKillCost = new Bank();
	// Calculate per kill cost:

	if (consumableCosts.length > 0) {
		for (const cc of consumableCosts) {
			let consumable = cc;

			if (
				consumable.alternativeConsumables &&
				!user.owns(calculateTripConsumableCost(consumable, quantity, duration))
			) {
				for (const c of consumable.alternativeConsumables) {
					if (user.owns(calculateTripConsumableCost(c, quantity, duration))) {
						consumable = c;
						break;
					}
				}
			}

			let itemMultiple = consumable.qtyPerKill ?? consumable.qtyPerMinute ?? null;
			if (itemMultiple) {
				if (consumable.isRuneCost) {
					// Free casts for kodai + sotd
					if (user.hasEquipped('Kodai wand')) {
						itemMultiple = Math.ceil(0.85 * itemMultiple);
					} else if (user.hasEquipped('Staff of the dead')) {
						itemMultiple = Math.ceil((6 / 7) * itemMultiple);
					}
				}

				let multiply = itemMultiple;

				// Calculate the duration for 1 kill and check how much will be used in 1 kill
				if (consumable.qtyPerMinute) multiply = (timeToFinish / Time.Minute) * itemMultiple;

				// Calculate supply for 1 kill
				const oneKcCost = consumable.itemCost.clone().multiply(multiply);

				// Can't use Bank.add() because it discards < 1 qty.
				for (const [itemID, qty] of Object.entries(oneKcCost.bank)) {
					if (perKillCost.bank[itemID]) perKillCost.bank[itemID] += qty;
					else perKillCost.bank[itemID] = qty;
				}
			}
		}
		// This will be replaced with a generic function in another PR
		if (infiniteWaterRunes) perKillCost.remove('Water rune', perKillCost.amount('Water rune'));
		// Calculate how many monsters can be killed with that cost:
		const fits = user.bankWithGP.fits(perKillCost);
		if (fits < Number(quantity)) {
			duration = Math.floor(duration * (fits / Number(quantity)));
			quantity = fits;
		}
		const { bank } = perKillCost.clone().multiply(Number(quantity));
		// Ceil cost QTY to avoid fractions
		for (const [item, qty] of Object.entries(bank)) {
			bank[item] = Math.ceil(qty);
		}

		pvmCost = true;
		lootToRemove.add(bank);
	}
	if (pvmCost) {
		if (quantity === 0 || !user.owns(lootToRemove)) {
			return `You don't have the items needed to kill any amount of ${
				monster.name
			}, you need: ${formatMissingItems(consumableCosts, timeToFinish)} per kill.`;
		}
	}

	if (monster.projectileUsage?.required) {
		if (!user.gear.range.ammo?.item) {
			return `You need range ammo equipped to kill ${monster.name}.`;
		}
		const rangeCheck = checkRangeGearWeapon(user.gear.range);
		if (typeof rangeCheck === 'string') {
			return `Your range gear isn't right: ${rangeCheck}`;
		}
		const projectilesNeeded = monster.projectileUsage.calculateQuantity({ quantity });
		lootToRemove.add(rangeCheck.ammo.item, projectilesNeeded);
		if (projectilesNeeded > rangeCheck.ammo.quantity) {
			return `You need ${projectilesNeeded.toLocaleString()}x ${itemNameFromID(
				rangeCheck.ammo.item
			)} to kill ${quantity}x ${
				monster.name
			}, and you have ${rangeCheck.ammo.quantity.toLocaleString()}x equipped.`;
		}
	}

	if (monster.requiredQuests) {
		const incompleteQuest = monster.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
		if (incompleteQuest) {
			return `You need to have completed the ${bold(
				quests.find(i => i.id === incompleteQuest)!.name
			)} quest to kill ${monster.name}.`;
		}
	}

	duration = randomVariation(duration, 3);

	if (isWeekend()) {
		boosts.push('10% for Weekend');
		duration *= 0.9;
	}

	const degradeablesWithEnoughCharges = [];
	for (const degItem of degItemBeingUsed) {
		const chargesNeeded = Math.ceil(
			degItem.charges({
				killableMon: monster,
				osjsMonster: osjsMon!,
				totalHP: monsterHP * quantity,
				user,
				duration
			})
		);
		const result = await checkUserCanUseDegradeableItem({
			item: degItem.item,
			chargesToDegrade: chargesNeeded,
			user
		});
		if (!result.hasEnough) {
			return result.userMessage;
		}
		degradeablesWithEnoughCharges.push({ degItem, chargesNeeded });
	}
	for (const { degItem, chargesNeeded } of degradeablesWithEnoughCharges) {
		const degradeResult = await degradeItem({
			item: degItem.item,
			chargesToDegrade: chargesNeeded,
			user
		});
		messages.push(degradeResult.userMessage);
	}

	let wildyPeak = null;
	let pkString = '';
	let thePkCount: number | undefined = undefined;
	let hasDied: boolean | undefined = undefined;
	let hasWildySupplies = undefined;

	if (isInWilderness) {
		await increaseWildEvasionXp(user, duration);
		thePkCount = 0;
		hasDied = false;
		const date = new Date().getTime();
		const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
		for (const peak of cachedPeakInterval) {
			if (peak.startTime < date && peak.finishTime > date) {
				wildyPeak = peak;
				break;
			}
		}
		if (wildyPeak?.peakTier === PeakTier.High && !user.bitfield.includes(BitField.DisableHighPeakTimeWarning)) {
			if (interaction) {
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to kill ${monster.name} during high peak time? PKers are more active.`
				);
			}
		}

		const antiPkBrewsNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));
		const antiPkRestoresNeeded = Math.max(1, Math.floor(duration / (8 * Time.Minute)));
		const antiPkKarambwanNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));

		const antiPKSupplies = new Bank();
		if (user.bank.amount('Blighted super restore(4)') >= antiPkRestoresNeeded) {
			antiPKSupplies.add('Blighted super restore(4)', antiPkRestoresNeeded);
		} else {
			antiPKSupplies.add('Super restore(4)', antiPkRestoresNeeded);
		}
		if (user.bank.amount('Blighted karambwan') >= antiPkKarambwanNeeded + 20) {
			antiPKSupplies.add('Blighted karambwan', antiPkKarambwanNeeded);
		} else {
			antiPKSupplies.add('Cooked karambwan', antiPkKarambwanNeeded);
		}
		antiPKSupplies.add('Saradomin brew(4)', antiPkBrewsNeeded);

		hasWildySupplies = true;
		if (!user.bank.has(antiPKSupplies)) {
			hasWildySupplies = false;
			if (interaction) {
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to kill ${monster.name} without anti-pk supplies? You should bring at least ${antiPKSupplies} on this trip for safety to not die and potentially get smited.`
				);
			}
		} else {
			lootToRemove.add(antiPKSupplies);
			pkString +=
				'Your minion brought some supplies to survive potential pkers. (Handed back after trip if lucky)\n';
		}
		const [pkCount, died, chanceString] = await calcWildyPKChance(
			user,
			wildyPeak!,
			monster,
			duration,
			hasWildySupplies,
			cannonMulti
		);
		thePkCount = pkCount;
		hasDied = died;
		pkString += chanceString;
	}

	// Check food
	let foodStr = '';
	// Find best eatable boost and add 1% extra
	const noFoodBoost = Math.floor(Math.max(...Eatables.map(eatable => eatable.pvmBoost ?? 0)) + 1);
	if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
		const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, user);
		foodStr += foodMessages;

		let gearToCheck: GearSetupType = convertAttackStyleToGearSetup(monster.attackStyleToUse);
		if (isInWilderness) gearToCheck = 'wildy';

		try {
			const { foodRemoved, reductions, reductionRatio } = await removeFoodFromUser({
				user,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: isInWilderness
					? ['wildy']
					: uniqueArr([...objectKeys(monster.minimumGearRequirements ?? {}), gearToCheck]),
				learningPercentage: percentReduced,
				isWilderness: isInWilderness
			});

			if (foodRemoved.length === 0) {
				boosts.push(`${noFoodBoost}% for no food`);
				duration = reduceNumByPercent(duration, noFoodBoost);
			} else {
				for (const [item, qty] of foodRemoved.items()) {
					const eatable = Eatables.find(e => e.id === item.id);
					if (!eatable) continue;

					const healAmount =
						typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(user);
					const amountHealed = qty * healAmount;
					if (amountHealed < calcPercentOfNum(75 * reductionRatio, healAmountNeeded * quantity)) continue;
					const boost = eatable.pvmBoost;
					if (boost) {
						if (boost < 0) {
							boosts.push(`${boost}% for ${eatable.name}`);
							duration = increaseNumByPercent(duration, Math.abs(boost));
						} else {
							boosts.push(`${boost}% for ${eatable.name}`);
							duration = reduceNumByPercent(duration, boost);
						}
					}
					break;
				}
			}

			totalCost.add(foodRemoved);
			if (reductions.length > 0) {
				foodStr += `, ${reductions.join(', ')}`;
			}
			foodStr += `, **Removed ${foodRemoved}**`;
		} catch (e: any) {
			if (typeof e === 'string') {
				return e;
			}
			if (e.message) {
				return e.message;
			}
		}
	} else {
		boosts.push(`${noFoodBoost}% for no food`);
		duration = reduceNumByPercent(duration, noFoodBoost);
	}

	// Remove items after food calc to prevent losing items if the user doesn't have the right amount of food. Example: Mossy key
	if (lootToRemove.length > 0) {
		await updateBankSetting('economyStats_PVMCost', lootToRemove);
		await user.specialRemoveItems(lootToRemove, { wildy: !!isInWilderness });
		totalCost.add(lootToRemove);
	}

	if (totalCost.length > 0) {
		await trackLoot({
			id: monster.name,
			totalCost,
			type: 'Monster',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: totalCost
				}
			]
		});
	}

	await addSubTaskToActivityTask<MonsterActivityTaskOptions>({
		mi: monster.id,
		userID: user.id,
		channelID: channelID.toString(),
		q: quantity,
		iQty: inputQuantity,
		duration,
		type: 'MonsterKilling',
		usingCannon: !usingCannon ? undefined : usingCannon,
		cannonMulti: !cannonMulti ? undefined : cannonMulti,
		chinning: !chinning ? undefined : chinning,
		bob: !burstOrBarrage ? undefined : burstOrBarrage,
		died: hasDied,
		pkEncounters: thePkCount,
		hasWildySupplies,
		isInWilderness
	});
	let response = `${minionName} is now killing ${quantity}x ${monster.name}, it'll take around ${formatDuration(
		duration
	)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;

	if (pvmCost) {
		response += ` Removed ${lootToRemove}.`;
	}

	if (boosts.length > 0) {
		response += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	if (messages.length > 0) {
		response += `\n**Messages:** ${messages.join(', ')}.`;
	}

	if (foodStr) {
		response += `\n**Food:** ${foodStr}\n`;
	}

	if (pkString.length > 0) {
		response += `\n${pkString}`;
	}

	return response;
}

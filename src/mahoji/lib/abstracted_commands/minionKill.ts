import { ChartConfiguration } from 'chart.js';
import { bold, ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import {
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	objectKeys,
	reduceNumByPercent,
	round,
	sumArr,
	Time,
	uniqueArr
} from 'e';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { itemID } from 'oldschooljs/dist/util';

import { BitField, PeakTier, PvMMethod } from '../../../lib/constants';
import { Eatables } from '../../../lib/data/eatables';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { checkUserCanUseDegradeableItem, degradeablePvmBoostItems, degradeItem } from '../../../lib/degradeableItems';
import { Diary, DiaryTier, userhasDiaryTier } from '../../../lib/diaries';
import { GearSetupType } from '../../../lib/gear/types';
import { trackLoot } from '../../../lib/lootTrack';
import {
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonBanks,
	cannonMultiConsumables,
	cannonSingleConsumables,
	CombatOptionsEnum,
	iceBarrageConsumables,
	iceBurstConsumables,
	SlayerActivityConstants
} from '../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../lib/minions/data/killableMonsters/revs';
import {
	AttackStyles,
	calculateMonsterFood,
	convertAttackStylesToSetup,
	resolveAttackStyles
} from '../../../lib/minions/functions';
import reducedTimeFromKC from '../../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { Consumable } from '../../../lib/minions/types';
import { calcPOHBoosts } from '../../../lib/poh';
import { SkillsEnum } from '../../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { maxOffenceStats } from '../../../lib/structures/Gear';
import { Peak } from '../../../lib/tickers';
import { MonsterActivityTaskOptions } from '../../../lib/types/minions';
import {
	calculateSimpleMonsterDeathChance,
	calculateTripConsumableCost,
	checkRangeGearWeapon,
	convertAttackStyleToGearSetup,
	convertPvmStylesToGearSetup,
	formatDuration,
	formatItemBoosts,
	formatItemCosts,
	formatItemReqs,
	formatPohBoosts,
	isWeekend,
	itemNameFromID,
	randomVariation,
	stringMatches
} from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { calcWildyPKChance, increaseWildEvasionXp } from '../../../lib/util/calcWildyPkChance';
import { generateChart } from '../../../lib/util/chart';
import findMonster from '../../../lib/util/findMonster';
import getOSItem from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { hasMonsterRequirements, resolveAvailableItemBoosts } from '../../mahojiSettings';
import { nexCommand } from './nexCommand';
import { nightmareCommand } from './nightmareCommand';
import { getPOH } from './pohCommand';
import { quests } from './questCommand';
import { temporossCommand } from './temporossCommand';
import { wintertodtCommand } from './wintertodtCommand';
import { zalcanoCommand } from './zalcanoCommand';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

const revSpecialWeapons = {
	melee: getOSItem("Viggora's chainmace"),
	range: getOSItem("Craw's bow"),
	mage: getOSItem("Thammaron's sceptre")
} as const;

const revUpgradedWeapons = {
	melee: getOSItem('Ursine chainmace'),
	range: getOSItem('Webweaver bow'),
	mage: getOSItem('Accursed sceptre')
} as const;

function formatMissingItems(consumables: Consumable[], timeToFinish: number) {
	const str = [];

	for (const consumable of consumables) {
		str.push(formatItemCosts(consumable, timeToFinish));
	}

	return str.join(', ');
}

const { floor } = Math;

function applySkillBoost(user: MUser, duration: number, styles: AttackStyles[]): [number, string] {
	const skillTotal = sumArr(styles.map(s => user.skillLevel(s)));

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

export async function minionKillCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	channelID: string,
	name: string,
	quantity: number | undefined,
	method: PvMMethod | undefined,
	wilderness: boolean | undefined,
	solo: boolean | undefined
) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const inputQuantity = quantity;
	const { minionName } = user;
	const wildyGear = user.gear.wildy;
	const style = convertAttackStylesToSetup(user.user.attack_style);
	const key = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[style];

	const boosts = [];
	let messages: string[] = [];

	if (!name) return invalidMonsterMsg;

	if (stringMatches(name, 'nex')) return nexCommand(interaction, user, channelID, solo);
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, quantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name, quantity);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID);

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

	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.assignedTask !== null &&
		usersTask.currentTask !== null &&
		usersTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
	}

	if (monster.canBePked && wilderness === false) {
		return `You can't kill ${monster.name} outside the wilderness.`;
	}

	const isInWilderness = wilderness || (isOnTask && usersTask.assignedTask?.wilderness) || monster.canBePked;

	if (!monster.wildy && isInWilderness) {
		return `You can't kill ${monster.name} in the wilderness.`;
	}

	if (monster.id === Monsters.Jelly.id) {
		monster.canBarrage = isInWilderness;
	}

	const wildyGearStat = wildyGear.getStats()[key];
	const revGearPercent = Math.max(0, calcWhatPercent(wildyGearStat, maxOffenceStats[key]));

	if (revenants) {
		const weapon = wildyGear.equippedWeapon();
		if (!weapon) {
			return 'You have no weapon equipped in your Wildy outfit.';
		}

		if (weapon.equipment![key] < 10) {
			return `Your weapon is terrible, you can't kill Revenants. You should have ${style} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`/minion train\``;
		}
	}

	// Set chosen boost based on priority:
	const myCBOpts = user.combatOptions;
	const boostChoice = determineBoostChoice({
		cbOpts: myCBOpts as CombatOptionsEnum[],
		user,
		monster,
		method,
		isOnTask
	});

	// Check requirements
	const [hasReqs, reason] = hasMonsterRequirements(user, monster);
	if (!hasReqs) return reason ?? "You don't have the requirements to fight this monster";

	if (monster.diaryRequirement) {
		const [diary, tier]: [Diary, DiaryTier] = monster.diaryRequirement;
		const [hasDiary] = await userhasDiaryTier(user, tier);
		if (!hasDiary) {
			return `${user.minionName} is missing the ${diary.name} ${tier.name} diary to kill ${monster.name}.`;
		}
	}

	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, await user.getKC(monster.id));

	const [, osjsMon, attackStyles] = resolveAttackStyles(user, {
		monsterID: monster.id,
		boostMethod: boostChoice
	});
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
		boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
	}

	const monsterHP = osjsMon?.data.hitpoints ?? 100;

	// Black mask and salve don't stack.
	const oneSixthBoost = 16.67;
	let blackMaskBoost = 0;
	let blackMaskBoostMsg = '';
	let salveAmuletBoost = 0;
	let salveAmuletBoostMsg = '';
	let virtusBoost = 0;
	let virtusBoostMsg = '';

	let dragonBoost = 0;
	let dragonBoostMsg = '';
	let revBoost = 0;
	let revBoostMsg = '';

	const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	const isDragon = osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon);

	function applyRevWeaponBoost() {
		const style = convertAttackStylesToSetup(user.user.attack_style);
		const specialWeapon = revSpecialWeapons[style];
		const upgradedWeapon = revUpgradedWeapons[style];

		if (wildyGear.hasEquipped(specialWeapon.name)) {
			revBoost = 12.5;
			timeToFinish = reduceNumByPercent(timeToFinish, revBoost);
			revBoostMsg = `${revBoost}% for ${specialWeapon.name}`;
		}

		if (wildyGear.hasEquipped(upgradedWeapon.name)) {
			revBoost = 17.5;
			timeToFinish = reduceNumByPercent(timeToFinish, revBoost);
			revBoostMsg = `${revBoost}% for ${upgradedWeapon.name}`;
		}
	}

	function applyDragonBoost() {
		const hasDragonLance = monster?.canBePked
			? wildyGear.hasEquipped('Dragon hunter lance')
			: user.hasEquippedOrInBank('Dragon hunter lance');
		const hasDragonCrossbow = monster?.canBePked
			? wildyGear.hasEquipped('Dragon hunter crossbow')
			: user.hasEquippedOrInBank('Dragon hunter crossbow');

		if (
			(hasDragonLance && !attackStyles.includes(SkillsEnum.Ranged) && !attackStyles.includes(SkillsEnum.Magic)) ||
			(hasDragonCrossbow && attackStyles.includes(SkillsEnum.Ranged))
		) {
			dragonBoost = 15; // Common boost percentage for dragon-related gear
			dragonBoostMsg = hasDragonLance
				? `${dragonBoost}% for Dragon hunter lance`
				: `${dragonBoost}% for Dragon hunter crossbow`;
			timeToFinish = reduceNumByPercent(timeToFinish, dragonBoost);
		}
	}

	function applyBlackMaskBoost() {
		const hasBlackMask = monster?.canBePked
			? wildyGear.hasEquipped('Black mask')
			: user.hasEquippedOrInBank('Black mask');
		const hasBlackMaskI = monster?.canBePked
			? wildyGear.hasEquipped('Black mask (i)')
			: user.hasEquippedOrInBank('Black mask (i)');

		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (hasBlackMaskI) {
				blackMaskBoost = oneSixthBoost;
				blackMaskBoostMsg = `${blackMaskBoost}% for Black mask (i) on non-melee task`;
			}
		} else if (hasBlackMask) {
			blackMaskBoost = oneSixthBoost;
			blackMaskBoostMsg = `${blackMaskBoost}% for Black mask on melee task`;
		}
	}

	function calculateSalveAmuletBoost() {
		let salveBoost = false;
		let salveEnhanced = false;
		const style = attackStyles[0];
		if (style === 'ranged' || style === 'magic') {
			salveBoost = monster?.canBePked
				? wildyGear.hasEquipped('Salve amulet(i)')
				: user.hasEquippedOrInBank('Salve amulet (i)');
			salveEnhanced = monster?.canBePked
				? wildyGear.hasEquipped('Salve amulet(ei)')
				: user.hasEquippedOrInBank('Salve amulet (ei)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? '(ei)' : '(i)'
				} on non-melee task`;
			}
		} else {
			salveBoost = monster?.canBePked
				? wildyGear.hasEquipped('Salve amulet')
				: user.hasEquippedOrInBank('Salve amulet');
			salveEnhanced = monster?.canBePked
				? wildyGear.hasEquipped('Salve amulet (e)')
				: user.hasEquippedOrInBank('Salve amulet (e)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? ' (e)' : ''
				} on melee task`;
			}
		}
	}

	if (isInWilderness && monster.revsWeaponBoost) {
		applyRevWeaponBoost();
  }
 
	function calculateVirtusBoost() {
		let virtusPiecesEquipped = 0;
		for (const item of resolveItems(['Virtus mask', 'Virtus robe top', 'Virtus robe bottom'])) {
			if (user.gear.mage.hasEquipped(item)) {
				virtusPiecesEquipped += blackMaskBoost !== 0 && itemNameFromID(item) === 'Virtus mask' ? 0 : 1;
			}
		}

		virtusBoost = virtusPiecesEquipped * 2;
		virtusBoostMsg =
			virtusPiecesEquipped > 1
				? ` with ${virtusPiecesEquipped} Virtus pieces`
				: virtusPiecesEquipped > 0
				? ` with ${virtusPiecesEquipped} Virtus piece`
				: '';
	}

	if (isDragon && monster.name.toLowerCase() !== 'vorkath') {
		applyDragonBoost();
	}

	if (isOnTask) {
		applyBlackMaskBoost();
	}

	if (isUndead) {
		calculateSalveAmuletBoost();
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
	if ((method === 'burst' || method === 'barrage') && !monster!.canBarrage) {
		return `${monster!.name} cannot be barraged or burst.`;
	}
	if (method === 'cannon' && !hasCannon) {
		return "You don't own a Dwarf multicannon, so how could you use one?";
	}
	if (method === 'cannon' && !monster!.canCannon) {
		return `${monster!.name} cannot be killed with a cannon.`;
	}
	if (boostChoice === 'barrage' && user.skillLevel(SkillsEnum.Magic) < 94) {
		return `You need 94 Magic to use Ice Barrage. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	if (boostChoice === 'burst' && user.skillLevel(SkillsEnum.Magic) < 70) {
		return `You need 70 Magic to use Ice Burst. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	if (boostChoice === 'chinning' && user.skillLevel(SkillsEnum.Ranged) < 65) {
		return `You need 65 Ranged to use Chinning method. You have ${user.skillLevel(SkillsEnum.Ranged)}`;
	}

	if (boostChoice === 'barrage' && attackStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBarrageConsumables);
		calculateVirtusBoost();
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBarrage + virtusBoost);
		boosts.push(`${boostIceBarrage + virtusBoost}% for Ice Barrage${virtusBoostMsg}`);
		burstOrBarrage = SlayerActivityConstants.IceBarrage;
	} else if (boostChoice === 'burst' && attackStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBurstConsumables);
		calculateVirtusBoost();
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBurst + virtusBoost);
		boosts.push(`${boostIceBurst + virtusBoost}% for Ice Burst${virtusBoostMsg}`);
		burstOrBarrage = SlayerActivityConstants.IceBurst;
	} else if (boostChoice === 'cannon' && hasCannon && monster!.cannonMulti) {
		usingCannon = true;
		cannonMulti = true;
		consumableCosts.push(cannonMultiConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostCannonMulti);
		boosts.push(`${boostCannonMulti}% for Cannon in multi`);
	} else if (boostChoice === 'cannon' && hasCannon && monster!.canCannon) {
		usingCannon = true;
		consumableCosts.push(cannonSingleConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostCannon);
		boosts.push(`${boostCannon}% for Cannon in singles`);
	} else if (method === 'chinning' && attackStyles.includes(SkillsEnum.Ranged) && monster!.canChinning) {
		chinning = true;
		// Check what Chinchompa to use
		const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
		let chinchompa = 'Black chinchompa';
		for (let chin of chinchompas) {
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
			const isUsing =
				convertPvmStylesToGearSetup(attackStyles).includes(degItem.attackStyle) &&
				user.gear[degItem.attackStyle].hasEquipped(degItem.item.id);
			if (isUsing) {
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
		let effectiveQtyRemaining = usersTask.currentTask!.quantity_remaining;
		if (
			monster.id === Monsters.KrilTsutsaroth.id &&
			usersTask.currentTask!.monster_id !== Monsters.KrilTsutsaroth.id
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		} else if (monster.id === Monsters.Kreearra.id && usersTask.currentTask!.monster_id !== Monsters.Kreearra.id) {
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
		if (user.bank.amount('Blighted karambwan') >= antiPkKarambwanNeeded) {
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
			hasWildySupplies
		);
		thePkCount = pkCount;
		hasDied = died;
		pkString += chanceString;
	}

	// Check food
	let foodStr: string = '';
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
		updateBankSetting('economyStats_PVMCost', lootToRemove);
		await user.specialRemoveItems(lootToRemove, { wildy: isInWilderness ? true : false });
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
		monsterID: monster.id,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		iQty: inputQuantity,
		duration,
		type: 'MonsterKilling',
		usingCannon: !usingCannon ? undefined : usingCannon,
		cannonMulti: !cannonMulti ? undefined : cannonMulti,
		chinning: !chinning ? undefined : chinning,
		burstOrBarrage: !burstOrBarrage ? undefined : burstOrBarrage,
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

export async function monsterInfo(user: MUser, name: string): Promise<string | InteractionReplyOptions> {
	const monster = findMonster(name);

	if (stringMatches(name, 'nightmare')) {
		return 'The Nightmare is not supported by this command due to the complexity of the fight.';
	}

	if (!monster) {
		return "That's not a valid monster";
	}
	const osjsMon = Monsters.get(monster.id);
	const [, , attackStyles] = resolveAttackStyles(user, {
		monsterID: monster.id
	});

	const userKc = await user.getKC(monster.id);
	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, userKc);

	// item boosts
	const ownedBoostItems = [];
	let totalItemBoost = 0;
	for (const [itemID, boostAmount] of Object.entries(resolveAvailableItemBoosts(user, monster))) {
		timeToFinish *= (100 - boostAmount) / 100;
		totalItemBoost += boostAmount;
		ownedBoostItems.push(itemNameFromID(parseInt(itemID)));
	}

	let isDragon = false;
	if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
		isDragon = true;
		if (
			user.hasEquippedOrInBank('Dragon hunter lance') &&
			!attackStyles.includes(SkillsEnum.Ranged) &&
			!attackStyles.includes(SkillsEnum.Magic)
		) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			ownedBoostItems.push('Dragon hunter lance');
			totalItemBoost += 15;
		} else if (user.hasEquippedOrInBank('Dragon hunter crossbow') && attackStyles.includes(SkillsEnum.Ranged)) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			ownedBoostItems.push('Dragon hunter crossbow');
			totalItemBoost += 15;
		}
	}
	// poh boosts
	if (monster.pohBoosts) {
		const [boostPercent, messages] = calcPOHBoosts(await getPOH(user.id), monster.pohBoosts);
		if (boostPercent > 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			let boostString = messages.join(' ').replace(RegExp('[0-9]{2}% for '), '');
			ownedBoostItems.push(`${boostString}`);
			totalItemBoost += boostPercent;
		}
	}
	// combat stat boosts
	const skillTotal = sumArr(attackStyles.map(s => user.skillLevel(s)));

	let percent = round(calcWhatPercent(skillTotal, attackStyles.length * 99), 2);

	const str = [`**${monster.name}**\n`];

	let skillString = '';

	if (percent < 50) {
		percent = 50 - percent;
		skillString = `Skills boost: -${percent.toFixed(2)}% for your skills.\n`;
		timeToFinish = increaseNumByPercent(timeToFinish, percent);
	} else {
		percent = Math.min(15, percent / 6.5);
		skillString = `Skills boost: ${percent.toFixed(2)}% for your skills.\n`;
		timeToFinish = reduceNumByPercent(timeToFinish, percent);
	}
	let hpString = '';
	// Find best eatable boost and add 1% extra
	const noFoodBoost = Math.floor(Math.max(...Eatables.map(eatable => eatable.pvmBoost ?? 0)) + 1);
	if (monster.healAmountNeeded) {
		const [hpNeededPerKill] = calculateMonsterFood(monster, user);
		if (hpNeededPerKill === 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, noFoodBoost);
			hpString = `${noFoodBoost}% boost for no food`;
		}
	}
	const maxCanKillSlay = Math.floor(calcMaxTripLength(user, 'MonsterKilling') / reduceNumByPercent(timeToFinish, 15));
	const maxCanKill = Math.floor(calcMaxTripLength(user, 'MonsterKilling') / timeToFinish);

	const { QP } = user;

	str.push(`**Barrage/Burst**: ${monster.canBarrage ? 'Yes' : 'No'}`);
	str.push(
		`**Cannon**: ${monster.canCannon ? `Yes, ${monster.cannonMulti ? 'multi' : 'single'} combat area` : 'No'}\n`
	);

	if (monster.qpRequired) {
		str.push(`${monster.name} requires **${monster.qpRequired}qp** to kill, and you have ${QP}qp.\n`);
	}

	let itemRequirements = [];
	if (monster.itemsRequired && monster.itemsRequired.length > 0) {
		itemRequirements.push(`**Items Required:** ${formatItemReqs(monster.itemsRequired)}\n`);
	}
	if (monster.itemCost) {
		itemRequirements.push(
			`**Item Cost per Trip:** ${formatItemCosts(monster.itemCost, timeToFinish * maxCanKill)}\n`
		);
	}

	if (monster.healAmountNeeded) {
		let [hpNeededPerKill, gearStats] = calculateMonsterFood(monster, user);
		let gearReductions = gearStats.replace(RegExp(': Reduced from (?:[0-9]+?), '), '\n').replace('), ', ')\n');
		if (hpNeededPerKill > 0) {
			itemRequirements.push(
				`**Healing Required:** ${gearReductions}\nYou require ${
					hpNeededPerKill * maxCanKill
				} hp for a full trip\n`
			);
		} else {
			itemRequirements.push(`**Healing Required:** ${gearReductions}\n**Food boost**: ${hpString}\n`);
		}
	}
	str.push(`${itemRequirements.join('')}`);
	let totalBoost = [];
	if (isDragon) {
		totalBoost.push('15% for Dragon hunter lance OR 15% for Dragon hunter crossbow');
	}
	if (monster.itemInBankBoosts) {
		totalBoost.push(`${formatItemBoosts(monster.itemInBankBoosts)}`);
	}
	if (monster.equippedItemBoosts) {
		for (const boostSet of monster.equippedItemBoosts) {
			totalBoost.push(
				`${boostSet.items
					.map(i => `${i.boostPercent}% for ${itemNameFromID(i.itemID)}`)
					.join(' OR ')}, equipped in ${boostSet.gearSetup} setup`
			);
		}
	}
	if (monster.pohBoosts) {
		totalBoost.push(
			`${formatPohBoosts(monster.pohBoosts)
				.replace(RegExp('(Pool:)'), '')
				.replace(')', '')
				.replace('(', '')
				.replace('\n', '')}`
		);
	}
	if (totalBoost.length > 0) {
		str.push(
			`**Boosts**\nAvailable Boosts: ${totalBoost.join(',')}\n${
				ownedBoostItems.length > 0 ? `Your boosts: ${ownedBoostItems.join(', ')} for ${totalItemBoost}%` : ''
			}\n${skillString}`
		);
	} else {
		str.push(`**Boosts**\n${skillString}`);
	}
	str.push('**Trip info**');

	str.push(
		`Maximum trip length: ${formatDuration(
			calcMaxTripLength(user, 'MonsterKilling')
		)}\nNormal kill time: ${formatDuration(
			monster.timeToFinish
		)}. You can kill up to ${maxCanKill} per trip (${formatDuration(timeToFinish)} per kill).`
	);
	str.push(
		`If you were on a slayer task: ${maxCanKillSlay} per trip (${formatDuration(
			reduceNumByPercent(timeToFinish, 15)
		)} per kill).`
	);
	const kcForOnePercent = Math.ceil((Time.Hour * 5) / monster.timeToFinish);

	str.push(
		`Every ${kcForOnePercent}kc you will gain a 1% (upto 10%).\nYou currently recieve a ${percentReduced}% boost with your ${userKc}kc.\n`
	);

	const min = timeToFinish * maxCanKill * 1.01;
	const max = timeToFinish * maxCanKill * 1.2;
	str.push(
		`Due to the random variation of an added 1-20% duration, ${maxCanKill}x kills can take between (${formatDuration(
			min
		)}) and (${formatDuration(max)})\nIf the Weekend boost is active, it takes: (${formatDuration(
			min * 0.9
		)}) to (${formatDuration(max * 0.9)}) to finish.\n`
	);

	if (monster.degradeableItemUsage) {
		for (const item of monster.degradeableItemUsage) {
			str.push(
				`${item.items.map(i => `${itemNameFromID(i.itemID)} (${i.boostPercent}% boost)`).join(' OR ')} ${
					item.required ? 'must' : 'can'
				} be equipped in your ${item.gearSetup} setup, needs to be charged using /minion charge.`
			);
		}
	}

	let response: InteractionReplyOptions = {
		content: str.join('\n')
	};

	if (monster.deathProps) {
		const maxKillCount = 200;
		const values: [string, number][] = [];
		for (let currentKC = 0; currentKC <= maxKillCount; currentKC += 5) {
			let deathChancePercent = calculateSimpleMonsterDeathChance({ ...monster.deathProps, currentKC });
			values.push([currentKC.toString(), round(deathChancePercent, 1)]);
		}
		const options: ChartConfiguration = {
			type: 'line',
			data: {
				labels: values.map(i => `${i[0]}KC`),
				datasets: [
					{
						data: values.map(i => i[1])
					}
				]
			},
			options: {
				plugins: {
					title: { display: true, text: 'Death Chance vs Kill Count' },
					datalabels: {
						font: {
							weight: 'bolder'
						},
						formatter(value) {
							return `${value}%`;
						}
					},
					legend: {
						display: false
					}
				},
				scales: {
					y: {
						min: 1,
						max: 100,
						ticks: {
							callback(value) {
								return `${value}%`;
							}
						}
					}
				}
			}
		};
		const chart = await generateChart(options);
		response.files = [chart];
	}

	return response;
}

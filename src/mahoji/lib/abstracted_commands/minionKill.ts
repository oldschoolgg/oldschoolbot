import { PlayerOwnedHouse, Prisma, User } from '@prisma/client';
import { ChartConfiguration } from 'chart.js';
import { bold, ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';
import {
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	notEmpty,
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

import { BitField, PeakTier, PvMMethod, YETI_ID } from '../../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../lib/data/CollectionsExport';
import { Eatables } from '../../../lib/data/eatables';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { checkUserCanUseDegradeableItem, degradeablePvmBoostItems, degradeItem } from '../../../lib/degradeableItems';
import { Diary, DiaryTier, userhasDiaryTier } from '../../../lib/diaries';
import { readableStatName, UserFullGearSetup } from '../../../lib/gear';
import { GearSetupType, GearStat } from '../../../lib/gear/types';
import { canAffordInventionBoost, InventionID, inventionItemBoost } from '../../../lib/invention/inventions';
import { trackLoot } from '../../../lib/lootTrack';
import {
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	boostSuperiorCannon,
	boostSuperiorCannonMulti,
	cannonBanks,
	cannonMultiConsumables,
	cannonSingleConsumables,
	CombatOptionsEnum,
	iceBarrageConsumables,
	iceBurstConsumables,
	SlayerActivityConstants,
	superiorCannonSingleConsumables
} from '../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../lib/minions/data/killableMonsters/revs';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import {
	AttackStyles,
	calculateMonsterFood,
	convertAttackStylesToSetup,
	resolveAttackStyles
} from '../../../lib/minions/functions';
import { calculateMonsterFoodRaw } from '../../../lib/minions/functions/calculateMonsterFood';
import reducedTimeFromKC from '../../../lib/minions/functions/reducedTimeFromKC';
import { calcFoodToRemoveFoodFromUser } from '../../../lib/minions/functions/removeFoodFromUser';
import { Consumable } from '../../../lib/minions/types';
import { calcPOHBoosts } from '../../../lib/poh';
import { SkillsEnum } from '../../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { addStatsOfItemsTogether, maxOffenceStats } from '../../../lib/structures/Gear';
import { LiteUser } from '../../../lib/structures/LiteUser';
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
import { calcWildyPKChance } from '../../../lib/util/calcWildyPkChance';
import { generateChart } from '../../../lib/util/chart';
import findMonster from '../../../lib/util/findMonster';
import getOSItem from '../../../lib/util/getOSItem';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { hasMonsterRequirements, resolveAvailableItemBoosts, userStatsUpdate } from '../../mahojiSettings';
import { findBingosWithUserParticipating } from '../bingo/BingoManager';
import { igneCommand } from './igneCommand';
import { kgCommand } from './kgCommand';
import { kkCommand } from './kkCommand';
import { moktangCommand } from './moktangCommand';
import { naxxusCommand } from './naxxusCommand';
import { nexCommand } from './nexCommand';
import { nightmareCommand } from './nightmareCommand';
import { getPOH } from './pohCommand';
import { quests } from './questCommand';
import { temporossCommand } from './temporossCommand';
import { vasaCommand } from './vasaCommand';
import { wintertodtCommand } from './wintertodtCommand';
import { zalcanoCommand } from './zalcanoCommand';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

const revSpecialWeapons = {
	melee: getOSItem("Viggora's chainmace"),
	range: getOSItem("Craw's bow"),
	mage: getOSItem("Thammaron's sceptre")
} as const;

function formatMissingItems(consumables: Consumable[], timeToFinish: number) {
	const str = [];

	for (const consumable of consumables) {
		str.push(formatItemCosts(consumable, timeToFinish));
	}

	return str.join(', ');
}

const { floor } = Math;

const gorajanBoosts = [
	[gorajanArcherOutfit, 'range'],
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage']
] as const;

const gearstatToSetup = new Map()
	.set('attack_stab', 'melee')
	.set('attack_slash', 'melee')
	.set('attack_crush', 'melee')
	.set('attack_magic', 'mage')
	.set('attack_ranged', 'range');

function applySkillBoost(
	skillsAsLevels: MUser['skillsAsLevels'],
	duration: number,
	styles: AttackStyles[]
): [number, string] {
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

async function minionKillWrapper({
	user,
	interaction,
	channelID,
	quantityInput,
	nameInput,
	method
}: {
	user: MUser;
	interaction: ChatInputCommandInteraction;
	channelID: string;
	quantityInput: number | undefined;
	nameInput: string;
	method: PvMMethod | undefined;
}) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	if (stringMatches(nameInput, 'zalcano')) return zalcanoCommand(user, channelID);
	if (stringMatches(nameInput, 'tempoross')) return temporossCommand(user, channelID, quantityInput);
	if (['vasa', 'vasa magus'].some(i => stringMatches(i, nameInput)))
		return vasaCommand(user, channelID, quantityInput);
	if (nameInput.toLowerCase().includes('nightmare'))
		return nightmareCommand(user, channelID, nameInput, quantityInput);
	if (nameInput.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID);
	if (['igne ', 'ignecarus'].some(i => nameInput.toLowerCase().includes(i)))
		return igneCommand(interaction, user, channelID, nameInput, quantityInput);
	if (['kg', 'goldemar'].some(i => nameInput.toLowerCase().includes(i)))
		return kgCommand(interaction, user, channelID, nameInput, quantityInput);
	if (['kk', 'kalphite king'].some(i => nameInput.toLowerCase().includes(i)))
		return kkCommand(interaction, user, channelID, nameInput, quantityInput);
	if (nameInput.toLowerCase().includes('nex'))
		return nexCommand(interaction, user, channelID, nameInput, quantityInput);
	if (nameInput.toLowerCase().includes('moktang')) return moktangCommand(user, channelID, quantityInput);
	if (nameInput.toLowerCase().includes('naxxus')) return naxxusCommand(user, channelID, quantityInput);

	if (!nameInput) return { error: invalidMonsterMsg };

	const maxTripLength = calcMaxTripLength(user, 'MonsterKilling');
	let monster = findMonster(nameInput);
	if (!monster) return { error: invalidMonsterMsg };

	const kcForThisMonster = await user.getKC(monster.id);

	if (monster.customRequirement && kcForThisMonster === 0) {
		const reasonDoesntHaveReq = await monster.customRequirement(user);
		if (reasonDoesntHaveReq) {
			return `You don't meet the requirements to kill this monster: ${reasonDoesntHaveReq}.`;
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

	// Check requirements
	const [hasReqs, reason] = hasMonsterRequirements(user, monster);
	if (!hasReqs) {
		return (reason as string) ?? "You don't have the requirements to fight this monster";
	}

	if (monster.diaryRequirement) {
		const [diary, tier]: [Diary, DiaryTier] = monster.diaryRequirement;
		const [hasDiary] = await userhasDiaryTier(user, tier);
		if (!hasDiary) {
			return `${user.minionName} is missing the ${diary.name} ${tier.name} diary to kill ${monster.name}.`;
		}
	}

	if (monster.minimumWeaponShieldStats) {
		for (const [setup, minimum] of Object.entries(monster.minimumWeaponShieldStats)) {
			const thisGear = user.gear[setup as GearSetupType];
			const stats = addStatsOfItemsTogether(
				[thisGear['2h']?.item, thisGear.weapon?.item, thisGear.shield?.item].filter(notEmpty)
			);
			for (const [key, requiredValue] of Object.entries(minimum)) {
				if (requiredValue < 1) continue;
				const theirValue = stats[key as GearStat] ?? 0;
				if (theirValue < requiredValue) {
					return `Your ${setup} weapons/shield need to have at least ${requiredValue} ${readableStatName(
						key
					)} to kill ${monster.name}, you have ${theirValue}.`;
				}
			}
		}
	}

	const currentSlayerTask = await getUsersCurrentSlayerInfo(user.id);

	const isOnTask =
		currentSlayerTask.assignedTask !== null &&
		currentSlayerTask.currentTask !== null &&
		currentSlayerTask.assignedTask.monsters.includes(monster.id);

	const myCBOpts = user.combatOptions;
	const boostChoice = determineBoostChoice({
		cbOpts: myCBOpts as CombatOptionsEnum[],
		user,
		monster,
		method,
		isOnTask
	});
	const hasSuperiorCannon = user.bank.has('Superior dwarf multicannon');
	const hasCannon = cannonBanks.some(i => user.bank.has(i)) || hasSuperiorCannon;

	if (!isOnTask && method && method !== 'none') {
		return 'You can only burst/barrage/cannon while on task in BSO.';
	}
	if ((method === 'burst' || method === 'barrage') && !monster!.canBarrage) {
		return `${monster!.name} cannot be barraged or burst.`;
	}
	if (method === 'cannon' && !hasCannon) {
		return "You don't own a Dwarf multicannon, so how could you use one?";
	}
	if (method === 'cannon' && !monster!.canCannon) {
		return `${monster!.name} cannot be killed with a cannon.`;
	}
	if (boostChoice === 'barrage' && user.skillsAsLevels.magic < 94) {
		return `You need 94 Magic to use Ice Barrage. You have ${user.skillsAsLevels.magic}`;
	}
	if (boostChoice === 'burst' && user.skillsAsLevels.magic < 70) {
		return `You need 70 Magic to use Ice Burst. You have ${user.skillsAsLevels.magic}`;
	}

	const userStats = await user.fetchStats({ pk_evasion_exp: true });

	const { usedDart } = minionKillCommand({
		nameInput,
		equippedPet: user.user.minion_equippedPet,
		quantityInput,
		maxTripLength,
		minionName: user.minionName,
		kcForThisMonster,
		userBank: user.bankWithGP,
		playerOwnedHouse: await getPOH(user.id),
		favoriteFood: user.user.favorite_food,
		method,
		gear: user.gear,
		disabledInventions: user.user.disabled_inventions,
		currentSlayerTask,
		skillsAsLevels: user.skillsAsLevels,
		bitfield: user.user.bitfield,
		hasCannon,
		gearBankCollection: new LiteUser({
			gear: Object.values(user.gear),
			bank: user.bankWithGP,
			skillsAsXP: user.skillsAsXP
		}),
		boostChoice,
		slayerUnlocks: user.user.slayer_unlocks,
		attackStyle: user.user.attack_style,
		pkEvasionExp: userStats.pk_evasion_exp
	});

	if (lootToRemove.length > 0) {
		updateBankSetting('economyStats_PVMCost', lootToRemove);
		await user.specialRemoveItems(lootToRemove, { wildy: monster.wildy ? true : false });
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

	if (usedDart) {
		await userStatsUpdate(user.id, () => ({
			death_touched_darts_used: {
				increment: 1
			}
		}));
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
		hasWildySupplies
	});
}

export function minionKillCommand({
	nameInput,
	equippedPet,
	quantityInput,
	maxTripLength,
	minionName,
	kcForThisMonster,
	userBank,
	method,
	gear,
	attackStyle,
	currentSlayerTask,
	playerOwnedHouse,
	disabledInventions,
	skillsAsLevels,
	gearBankCollection,
	slayerUnlocks,
	bitfield,
	pkEvasionExp,
	favoriteFood,
	boostChoice,
	hasCannon
}: {
	kcForThisMonster: number;
	nameInput: string;
	quantityInput: number | undefined;
	method: PvMMethod | undefined;
	equippedPet: number | null;
	maxTripLength: number;
	minionName: string;
	userBank: Bank;
	gear: UserFullGearSetup;
	attackStyle: User['attack_style'];
	currentSlayerTask: Awaited<ReturnType<typeof getUsersCurrentSlayerInfo>>;
	playerOwnedHouse: PlayerOwnedHouse;
	disabledInventions: User['disabled_inventions'];
	skillsAsLevels: MUser['skillsAsLevels'];
	gearBankCollection: LiteUser;
	slayerUnlocks: SlayerTaskUnlocksEnum[];
	bitfield: number[];
	pkEvasionExp: number;
	favoriteFood: number[];
	boostChoice: string;
	hasCannon: boolean;
}) {
	const style = convertAttackStylesToSetup(attackStyle);
	const key = ({ melee: 'attack_crush', mage: 'attack_magic', range: 'attack_ranged' } as const)[style];

	const boosts = [];
	let messages: string[] = [];

	if (equippedPet === itemID('Ishi')) {
		nameInput = 'Ogress Warrior';
	}

	let monster = findMonster(nameInput);
	if (!monster) throw new Error('Invalid monster');
	let revenants = false;

	const matchedRevenantMonster = revenantMonsters.find(monster =>
		monster.aliases.some(alias => stringMatches(alias, nameInput))
	);
	if (matchedRevenantMonster) {
		monster = matchedRevenantMonster;
		revenants = true;
	}

	const isOnTask =
		currentSlayerTask.assignedTask !== null &&
		currentSlayerTask.currentTask !== null &&
		currentSlayerTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
	}

	const wildyGearStat = gear.wildy.getStats()[key];
	const revGearPercent = Math.max(0, calcWhatPercent(wildyGearStat, maxOffenceStats[key]));

	if (revenants) {
		const weapon = gear.wildy.equippedWeapon();
		if (!weapon) {
			return 'You have no weapon equipped in your Wildy outfit.';
		}

		if (weapon.equipment![key] < 10) {
			return `Your weapon is terrible, you can't kill Revenants. You should have ${style} gear equipped in your wildy outfit, as this is what you're currently training. You can change this using \`/minion train\``;
		}
	}

	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, kcForThisMonster);

	const [, osjsMon, attackStyles] = resolveAttackStyles(user, {
		monsterID: monster.id,
		boostMethod: boostChoice
	});
	const [newTime, skillBoostMsg] = applySkillBoost(skillsAsLevels, timeToFinish, attackStyles);

	timeToFinish = newTime;
	boosts.push(skillBoostMsg);

	timeToFinish /= 2;
	boosts.push('2x BSO Boost');

	if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

	if (monster.pohBoosts) {
		const [boostPercent, messages] = calcPOHBoosts(playerOwnedHouse, monster.pohBoosts);
		if (boostPercent > 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			boosts.push(messages.join(' + '));
		}
	}

	for (const [itemID, boostAmount] of Object.entries(resolveAvailableItemBoosts(user, monster))) {
		timeToFinish *= (100 - boostAmount) / 100;
		boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
	}

	if (
		equippedPet === itemID('Gregoyle') &&
		[Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id].includes(monster.id)
	) {
		timeToFinish = reduceNumByPercent(timeToFinish, 20);
		boosts.push('20% boost for Gregoyle');
	}
	if (gearBankCollection.hasEquipped('Dwarven warhammer') && !monster.wildy) {
		timeToFinish = reduceNumByPercent(timeToFinish, 40);
		boosts.push('40% boost for Dwarven warhammer');
	}
	if (gear.wildy.hasEquipped(['Hellfire bow']) && monster.wildy) {
		timeToFinish /= 3;
		boosts.push('3x boost for Hellfire bow');
	}

	const monsterHP = osjsMon?.data.hitpoints ?? 100;

	// Black mask and salve don't stack.
	const oneSixthBoost = 16.67;
	let blackMaskBoost = 0;
	let blackMaskBoostMsg = '';
	let salveAmuletBoost = 0;
	let salveAmuletBoostMsg = '';

	const dragonBoost = 15; // Common boost percentage for dragon-related gear

	const isUndead = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	const isDragon = osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon);

	function applyDragonBoost() {
		const hasDragonLance = monster?.canBePked
			? gear.wildy.hasEquipped('Dragon hunter lance')
			: gearBankCollection.owns('Dragon hunter lance');
		const hasDragonCrossbow = monster?.canBePked
			? gear.wildy.hasEquipped('Dragon hunter crossbow')
			: gearBankCollection.owns('Dragon hunter crossbow');

		if (
			(hasDragonLance && !attackStyles.includes(SkillsEnum.Ranged) && !attackStyles.includes(SkillsEnum.Magic)) ||
			(hasDragonCrossbow && attackStyles.includes(SkillsEnum.Ranged))
		) {
			const boostMessage = hasDragonLance
				? `${dragonBoost}% for Dragon hunter lance`
				: `${dragonBoost}% for Dragon hunter crossbow`;
			timeToFinish = reduceNumByPercent(timeToFinish, dragonBoost);
			boosts.push(boostMessage);
		}
	}

	function applyBlackMaskBoost() {
		const hasInfernalSlayerHelmI = monster?.canBePked
			? gear.wildy.hasEquipped('Infernal slayer helmet(i)')
			: gearBankCollection.owns('Infernal slayer helmet(i)');
		const hasInfernalSlayerHelm = monster?.canBePked
			? gear.wildy.hasEquipped('Infernal slayer helmet')
			: gearBankCollection.owns('Infernal slayer helmet');
		const hasBlackMask = monster?.canBePked
			? gear.wildy.hasEquipped('Black mask')
			: gearBankCollection.owns('Black mask');
		const hasBlackMaskI = monster?.canBePked
			? gear.wildy.hasEquipped('Black mask (i)')
			: gearBankCollection.owns('Black mask (i)');

		if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (hasBlackMaskI) {
				blackMaskBoost = oneSixthBoost;
				blackMaskBoostMsg = `${blackMaskBoost}% for Black mask (i) on non-melee task`;
			}
		} else if (hasInfernalSlayerHelm) {
			blackMaskBoost = 17;
			blackMaskBoostMsg = `${blackMaskBoost}% for Infernal slayer helmet on melee task`;
		} else if (hasBlackMask) {
			blackMaskBoost = oneSixthBoost;
			blackMaskBoostMsg = `${blackMaskBoost}% for Black mask on melee task`;
		}

		if (hasInfernalSlayerHelmI) {
			blackMaskBoost = 22;
			blackMaskBoostMsg = `${blackMaskBoost}% for Infernal slayer helmet(i) on task`;
		}
	}

	function calculateSalveAmuletBoost() {
		let salveBoost = false;
		let salveEnhanced = false;
		const style = attackStyles[0];
		if (style === 'ranged' || style === 'magic') {
			salveBoost = monster?.canBePked
				? gear.wildy.hasEquipped('Salve amulet(i)')
				: gearBankCollection.owns('Salve amulet (i)');
			salveEnhanced = monster?.canBePked
				? gear.wildy.hasEquipped('Salve amulet(ei)')
				: gearBankCollection.owns('Salve amulet (ei)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? '(ei)' : '(i)'
				} on non-melee task`;
			}
		} else {
			salveBoost = monster?.canBePked
				? gear.wildy.hasEquipped('Salve amulet')
				: gearBankCollection.owns('Salve amulet');
			salveEnhanced = monster?.canBePked
				? gear.wildy.hasEquipped('Salve amulet (e)')
				: gearBankCollection.owns('Salve amulet (e)');
			if (salveBoost) {
				salveAmuletBoost = salveEnhanced ? 20 : oneSixthBoost;
				salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
					salveEnhanced ? ' (e)' : ''
				} on melee task`;
			}
		}
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

	if (revenants) {
		timeToFinish = reduceNumByPercent(timeToFinish, revGearPercent / 4);
		boosts.push(`${(revGearPercent / 4).toFixed(2)}% (out of a possible 25%) for ${key}`);

		const specialWeapon = revSpecialWeapons[style];
		if (gear.wildy.hasEquipped(specialWeapon.name)) {
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

	const { canAfford } = await canAffordInventionBoost(user, InventionID.SuperiorDwarfMultiCannon, timeToFinish);
	const canAffordSuperiorCannonBoost = hasSuperiorCannon ? canAfford : false;
	if (boostChoice === 'chinning' && skillsAsLevels.ranged < 65) {
		return `You need 65 Ranged to use Chinning method. You have ${skillsAsLevels.ranged}`;
	}

	if (
		boostChoice === 'cannon' &&
		!disabledInventions.includes(InventionID.SuperiorDwarfMultiCannon) &&
		canAffordSuperiorCannonBoost &&
		(monster.canCannon || monster.cannonMulti)
	) {
		let qty = quantityInput || floor(maxTripLength / timeToFinish);
		const res = await inventionItemBoost({
			user,
			inventionID: InventionID.SuperiorDwarfMultiCannon,
			duration: timeToFinish * qty
		});
		if (res.success) {
			usingCannon = true;
			consumableCosts.push(superiorCannonSingleConsumables);
			let boost = monster.cannonMulti ? boostSuperiorCannonMulti : boostSuperiorCannon;
			timeToFinish = reduceNumByPercent(timeToFinish, boost);
			boosts.push(`${boost}% for Superior Cannon (${res.messages})`);
		}
	} else if (boostChoice === 'barrage' && attackStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBarrageConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBarrage);
		boosts.push(`${boostIceBarrage}% for Ice Barrage`);
		burstOrBarrage = SlayerActivityConstants.IceBarrage;
	} else if (boostChoice === 'burst' && attackStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBurstConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, boostIceBurst);
		boosts.push(`${boostIceBurst}% for Ice Burst`);
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
	} else if ((method as string) === 'chinning' && attackStyles.includes(SkillsEnum.Ranged) && monster!.canChinning) {
		chinning = true;
		// Check what Chinchompa to use
		const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
		let chinchompa = 'Black chinchompa';
		for (let chin of chinchompas) {
			if (userBank.amount(chin) > 5000) {
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

	const hasBlessing = gearBankCollection.hasEquipped('Dwarven blessing');
	const hasZealotsAmulet = gearBankCollection.owns('Amulet of zealots');
	if (hasZealotsAmulet && hasBlessing) {
		timeToFinish *= 0.75;
		boosts.push('25% for Dwarven blessing & Amulet of zealots');
	} else if (hasBlessing) {
		timeToFinish *= 0.8;
		boosts.push('20% for Dwarven blessing');
	}
	if (monster.wildy && hasZealotsAmulet) {
		timeToFinish *= 0.95;
		boosts.push('5% for Amulet of zealots');
	}
	const allGorajan = gorajanBoosts.every(e => gear[e[1]].hasEquipped(e[0], true));
	for (const [outfit, setup] of gorajanBoosts) {
		if (
			allGorajan ||
			(gearstatToSetup.get(monster.attackStyleToUse) === setup && gear[setup].hasEquipped(outfit, true))
		) {
			boosts.push('10% for Gorajan');
			timeToFinish *= 0.9;
			break;
		}
	}

	if (attackStyles.includes(SkillsEnum.Ranged) && gearBankCollection.hasEquipped('Ranged master cape')) {
		timeToFinish *= 0.85;
		boosts.push('15% for Ranged master cape');
	} else if (attackStyles.includes(SkillsEnum.Magic) && gearBankCollection.hasEquipped('Magic master cape')) {
		timeToFinish *= 0.85;
		boosts.push('15% for Magic master cape');
	} else if (
		!attackStyles.includes(SkillsEnum.Magic) &&
		!attackStyles.includes(SkillsEnum.Ranged) &&
		gearBankCollection.hasEquipped('Attack master cape')
	) {
		timeToFinish *= 0.85;
		boosts.push('15% for Attack master cape');
	}

	/**
	 *
	 * Degradeable Items
	 *
	 */
	const degItemBeingUsed = [];
	if (monster.degradeableItemUsage) {
		for (const set of monster.degradeableItemUsage) {
			const equippedInThisSet = set.items.find(item => gear[set.gearSetup].hasEquipped(item.itemID));
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
				gear[degItem.attackStyle].hasEquipped(degItem.item.id) &&
				(monster.setupsUsed ? monster.setupsUsed.includes(degItem.attackStyle) : true);
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
			const equippedInThisSet = boostSet.items.find(item => gear[boostSet.gearSetup].hasEquipped(item.itemID));
			if (equippedInThisSet) {
				boosts.push(`${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`);
				timeToFinish = reduceNumByPercent(timeToFinish, equippedInThisSet.boostPercent);
			}
		}
	}

	// If no quantity provided, set it to the max.
	if (!quantityInput) {
		if ([Monsters.Skotizo.id].includes(monster.id)) {
			quantityInput = 1;
		} else {
			quantityInput = floor(maxTripLength / timeToFinish);
		}
	}

	let quantity = Math.max(1, quantityInput);

	if (isOnTask) {
		let effectiveQtyRemaining = currentSlayerTask.currentTask!.quantity_remaining;
		if (
			monster.id === Monsters.KrilTsutsaroth.id &&
			currentSlayerTask.currentTask!.monster_id !== Monsters.KrilTsutsaroth.id
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		} else if (
			monster.id === Monsters.Kreearra.id &&
			currentSlayerTask.currentTask!.monster_id !== Monsters.Kreearra.id
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 4);
		} else if (
			monster.id === Monsters.GrotesqueGuardians.id &&
			slayerUnlocks.includes(SlayerTaskUnlocksEnum.DoubleTrouble)
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		}
		quantity = Math.min(quantity, effectiveQtyRemaining);
	}
	let duration = timeToFinish * quantity;

	// If you have dwarven blessing, you need 1 prayer pot per 5 mins
	const prayerPots = userBank.amount('Prayer potion(4)');
	const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
	let prayerPotsNeeded = Math.max(1, fiveMinIncrements);
	const hasPrayerMasterCape = gearBankCollection.hasEquipped('Prayer master cape');
	if (hasPrayerMasterCape && hasBlessing) {
		boosts.push('40% less prayer pots');
		prayerPotsNeeded = Math.floor(0.6 * prayerPotsNeeded);
	}
	prayerPotsNeeded = Math.max(1, prayerPotsNeeded);
	if (hasBlessing) {
		if (prayerPots < prayerPotsNeeded) {
			return "You don't have enough Prayer potion(4)'s to power your Dwarven blessing.";
		}
	}

	if (monster.requiredBitfield && !bitfield.includes(monster.requiredBitfield)) {
		return "You haven't unlocked this monster..";
	}

	quantity = Math.max(1, quantity);
	if (!bitfield.includes(BitField.HasUnlockedYeti) && monster.id === YETI_ID) {
		quantity = 1;
	}
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

	const infiniteWaterRunes = getSimilarItems(itemID('Staff of water')).some(i => gearBankCollection.hasEquipped(i));
	const perKillCost = new Bank();
	// Calculate per kill cost:

	if (consumableCosts.length > 0) {
		for (const cc of consumableCosts) {
			let consumable = cc;

			if (
				consumable.alternativeConsumables &&
				!userBank.has(calculateTripConsumableCost(consumable, quantity, duration))
			) {
				for (const c of consumable.alternativeConsumables) {
					if (userBank.has(calculateTripConsumableCost(c, quantity, duration))) {
						consumable = c;
						break;
					}
				}
			}

			let itemMultiple = consumable.qtyPerKill ?? consumable.qtyPerMinute ?? null;
			if (itemMultiple) {
				if (consumable.isRuneCost) {
					// Free casts for kodai + sotd
					if (gearBankCollection.hasEquipped('Kodai wand')) {
						itemMultiple = Math.ceil(0.85 * itemMultiple);
					} else if (gearBankCollection.hasEquipped('Staff of the dead')) {
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
		const fits = userBank.fits(perKillCost);
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
		if (quantity === 0 || !userBank.has(lootToRemove)) {
			return `You don't have the items needed to kill any amount of ${
				monster.name
			}, you need: ${formatMissingItems(consumableCosts, timeToFinish)} per kill.`;
		}
	}

	if (monster.projectileUsage?.required) {
		if (!gear.range.ammo?.item) {
			return `You need range ammo equipped to kill ${monster.name}.`;
		}
		if (
			monster.projectileUsage.requiredAmmo &&
			!monster.projectileUsage.requiredAmmo.includes(gear.range.ammo.item)
		) {
			return `You need to be using one of these projectiles to fight ${
				monster.name
			}: ${monster.projectileUsage.requiredAmmo.map(itemNameFromID).join(', ')}.`;
		}
		const rangeCheck = checkRangeGearWeapon(gear.range);
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

	duration = randomVariation(duration, 3);

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
		boosts.push(`${degItem.boost}% for ${degItem.item.name}`);
		messages.push(degradeResult.userMessage);
		duration = reduceNumByPercent(duration, degItem.boost);
	}

	if (isWeekend()) {
		boosts.push('10% for Weekend');
		duration *= 0.9;
	}

	if (hasBlessing && prayerPotsNeeded) {
		const prayerPotsBank = new Bank().add('Prayer potion(4)', prayerPotsNeeded);
		lootToRemove.add(prayerPotsBank);
	}
	const rangeSetup = { ...gear.range.raw() };
	let usedDart = false;
	if (rangeSetup.weapon?.item === itemID('Deathtouched dart')) {
		const bingos = await findBingosWithUserParticipating(user.id);
		if (bingos.some(bingo => bingo.isActive())) {
			return 'You cannot use Deathtouched darts while in an active Bingo.';
		}
		duration = 1;
		if (rangeSetup.weapon.quantity > 1) {
			rangeSetup.weapon.quantity--;
		} else {
			rangeSetup.weapon = null;
		}
		await user.update({
			gear_range: rangeSetup as Prisma.InputJsonObject
		});
		if (monster.name === 'Koschei the deathless') {
			return (
				'You send your minion off to fight Koschei with a Deathtouched dart, they stand a safe distance and throw the dart - Koschei immediately locks' +
				' eyes with your minion and grabs the dart mid-air, and throws it back, killing your minion instantly.'
			);
		}
		if (monster.name === 'Solis') {
			return 'The dart melts into a crisp dust before coming into contact with Solis.';
		}
		if (monster.name === 'Yeti') {
			return 'You send your minion off to fight Yeti with a Deathtouched dart, they stand a safe distance and throw the dart - the cold, harsh wind blows it out of the air. Your minion runs back to you in fear.';
		}
		usedDart = true;
	}
	if (monster.name === 'Koschei the deathless') {
		return 'You send your minion off to fight Koschei, before they even get close, they feel an immense, powerful fear and return back.';
	}

	const confirmations: string[] = [];

	let wildyPeak = null;
	let pkString = '';
	let thePkCount: number | undefined = undefined;
	let hasDied: boolean | undefined = undefined;
	let hasWildySupplies = undefined;

	if (monster.canBePked) {
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
		if (wildyPeak?.peakTier === PeakTier.High) {
			confirmations.push(
				`Are you sure you want to kill ${monster.name} during high peak time? PKers are more active.`
			);
		}

		const antiPkBrewsNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));
		const antiPkRestoresNeeded = Math.max(1, Math.floor(duration / (8 * Time.Minute)));
		const antiPkKarambwanNeeded = Math.max(1, Math.floor(duration / (4 * Time.Minute)));

		const antiPKSupplies = new Bank();
		if (userBank.amount('Blighted super restore(4)') >= antiPkRestoresNeeded) {
			antiPKSupplies.add('Blighted super restore(4)', antiPkRestoresNeeded);
		} else {
			antiPKSupplies.add('Super restore(4)', antiPkRestoresNeeded);
		}
		if (userBank.amount('Blighted karambwan') >= antiPkKarambwanNeeded) {
			antiPKSupplies.add('Blighted karambwan', antiPkKarambwanNeeded);
		} else {
			antiPKSupplies.add('Cooked karambwan', antiPkKarambwanNeeded);
		}
		antiPKSupplies.add('Saradomin brew(4)', antiPkBrewsNeeded);

		hasWildySupplies = true;
		if (!userBank.has(antiPKSupplies)) {
			hasWildySupplies = false;
			confirmations.push(
				`Are you sure you want to kill ${monster.name} without anti-pk supplies? You should bring at least ${antiPKSupplies} on this trip for safety to not die and potentially get smited.`
			);
		} else {
			lootToRemove.add(antiPKSupplies);
			pkString +=
				'Your minion brought some supplies to survive potential pkers. (Handed back after trip if lucky)\n';
		}
		const [pkCount, died, chanceString] = calcWildyPKChance(
			pkEvasionExp,
			gear,
			skillsAsLevels,
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
		const [healAmountNeeded, foodMessages] = calculateMonsterFoodRaw(monster, gear);
		foodStr += foodMessages;

		let gearToCheck: GearSetupType = convertAttackStyleToGearSetup(monster.attackStyleToUse);
		if (monster.wildy) gearToCheck = 'wildy';

		try {
			const { foodToRemove, reductionRatio, reductions } = calcFoodToRemoveFoodFromUser({
				gear,
				favoriteFood,
				bank: userBank,
				skillsAsLevels,
				totalHealingNeeded: healAmountNeeded * quantity,
				attackStylesUsed: monster.wildy
					? ['wildy']
					: uniqueArr([...objectKeys(monster.minimumGearRequirements ?? {}), gearToCheck]),
				learningPercentage: percentReduced,
				isWilderness: monster.wildy,
				minimumHealAmount: monster.minimumFoodHealAmount
			});

			if (!foodToRemove) {
				return `You don't have enough food to kill ${monster.name}.`;
			}

			if (foodToRemove.length === 0) {
				boosts.push(`${noFoodBoost}% for no food`);
				duration = reduceNumByPercent(duration, noFoodBoost);
			} else {
				for (const [item, qty] of foodToRemove.items()) {
					const eatable = Eatables.find(e => e.id === item.id);
					if (!eatable) continue;

					const healAmount =
						typeof eatable.healAmount === 'number'
							? eatable.healAmount
							: eatable.healAmount(skillsAsLevels);
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

			totalCost.add(foodToRemove);
			if (reductions.length > 0) {
				foodStr += `, ${reductions.join(', ')}`;
			}
			foodStr += `, **Removed ${foodToRemove}**`;
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

	if (monster.deathProps) {
		const deathChance = calculateSimpleMonsterDeathChance({ ...monster.deathProps, currentKC: kcForThisMonster });
		messages.push(`${deathChance.toFixed(1)}% chance of death`);
	}

	if (usedDart) {
		return `<:deathtouched_dart:822674661967265843> ${minionName} used a **Deathtouched dart**.`;
	}

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

	return {
		response,
		confirmations,
		usedDart,
		usingCannon,
		cannonMulti,
		chinning,
		thePkCount,
		hasDied,
		burstOrBarrage
	};
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
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			ownedBoostItems.push('Dragon hunter lance');
			totalItemBoost += 20;
		} else if (user.hasEquippedOrInBank('Dragon hunter crossbow') && attackStyles.includes(SkillsEnum.Ranged)) {
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			ownedBoostItems.push('Dragon hunter crossbow');
			totalItemBoost += 20;
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
	if (stringMatches(name, 'shaman') || stringMatches(name, 'lizardman shaman')) {
		const [hasFavour] = gotFavour(user, Favours.Shayzien, 100);
		if (!hasFavour) {
			str.push('You require 100% Shayzien favour\n');
		} else {
			str.push('You meet the required 100% Shayzien favour\n');
		}
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

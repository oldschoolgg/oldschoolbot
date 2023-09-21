import { Prisma } from '@prisma/client';
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
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';
import { itemID } from 'oldschooljs/dist/util';

import { PeakTier, PvMMethod } from '../../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../lib/data/CollectionsExport';
import { Eatables } from '../../../lib/data/eatables';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { checkUserCanUseDegradeableItem, degradeItem } from '../../../lib/degradeableItems';
import { Diary, DiaryTier, userhasDiaryTier } from '../../../lib/diaries';
import { GearSetupType } from '../../../lib/gear/types';
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
import { AttackStyles, calculateMonsterFood, resolveAttackStyles } from '../../../lib/minions/functions';
import reducedTimeFromKC from '../../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { Consumable, KillableMonster } from '../../../lib/minions/types';
import { calcPOHBoosts } from '../../../lib/poh';
import { SkillsEnum } from '../../../lib/skilling/types';
import { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { Peak } from '../../../lib/tickers';
import { MonsterActivityTaskOptions } from '../../../lib/types/minions';
import {
	calculateSimpleMonsterDeathChance,
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
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { sendToChannelID } from '../../../lib/util/webhook';
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
import { revsCommand } from './revsCommand';
import { temporossCommand } from './temporossCommand';
import { vasaCommand } from './vasaCommand';
import { wintertodtCommand } from './wintertodtCommand';
import { zalcanoCommand } from './zalcanoCommand';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

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

const degradeableItemsCanUse: {
	item: Item;
	attackStyle: GearSetupType;
	charges: (
		_killableMon: KillableMonster,
		_monster: Monster,
		_totalHP: number,
		duration: number,
		user: MUser
	) => number;
	boost: number;
}[] = [
	{
		item: getOSItem('Sanguinesti staff'),
		attackStyle: 'mage',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 25,
		boost: 6
	},
	{
		item: getOSItem('Abyssal tentacle'),
		attackStyle: 'melee',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 20,
		boost: 3
	},
	{
		item: getOSItem('Void staff'),
		attackStyle: 'mage',
		boost: 8,

		charges: (
			_killableMon: KillableMonster,
			_monster: Monster,
			_totalHP: number,
			duration: number,
			user: MUser
		) => {
			const mageGear = user.gear.mage;
			const minutesDuration = Math.ceil(duration / Time.Minute);
			if (user.hasEquipped('Magic master cape')) {
				return Math.ceil(minutesDuration / 3);
			} else if (mageGear.hasEquipped('Vasa cloak')) {
				return Math.ceil(minutesDuration / 2);
			}
			return minutesDuration;
		}
	},
	{
		item: getOSItem("Tumeken's shadow"),
		attackStyle: 'mage',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 40,
		boost: 6
	},
	{
		item: getOSItem('Sanguinesti staff'),
		attackStyle: 'mage',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 25,
		boost: 5
	},
	{
		item: getOSItem('Trident of the swamp'),
		attackStyle: 'mage',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 40,
		boost: 3
	},
	{
		item: getOSItem('Scythe of vitur'),
		attackStyle: 'melee',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 40,
		boost: 5
	},
	{
		item: getOSItem('Abyssal tentacle'),
		attackStyle: 'melee',
		charges: (_killableMon: KillableMonster, _monster: Monster, totalHP: number) => totalHP / 20,
		boost: 3
	}
];

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
	method: PvMMethod | undefined
) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const { minionName } = user;

	const boosts = [];
	let messages: string[] = [];

	if (!name) return invalidMonsterMsg;

	if (user.usingPet('Ishi')) {
		sendToChannelID(channelID.toString(), {
			content: `${user} Ishi Says: Let's kill some ogress warriors instead? 🥰 🐳`
		});
		name = 'Ogress Warrior';
	}
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, quantity);
	if (['vasa', 'vasa magus'].some(i => stringMatches(i, name))) return vasaCommand(user, channelID, quantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID);
	if (['igne ', 'ignecarus'].some(i => name.toLowerCase().includes(i)))
		return igneCommand(interaction, user, channelID, name, quantity);
	if (['kg', 'goldemar'].some(i => name.toLowerCase().includes(i)))
		return kgCommand(interaction, user, channelID, name, quantity);
	if (['kk', 'kalphite king'].some(i => name.toLowerCase().includes(i)))
		return kkCommand(interaction, user, channelID, name, quantity);
	if (name.toLowerCase().includes('nex')) return nexCommand(interaction, user, channelID, name, quantity);
	if (name.toLowerCase().includes('moktang')) return moktangCommand(user, channelID, quantity);
	if (name.toLowerCase().includes('naxxus')) return naxxusCommand(user, channelID, quantity);

	if (revenantMonsters.some(i => i.aliases.some(a => stringMatches(a, name)))) {
		return revsCommand(user, channelID, interaction, name);
	}

	const monster = findMonster(name);
	if (!monster) return invalidMonsterMsg;
	const maxTripLength = calcMaxTripLength(user, 'MonsterKilling');

	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.assignedTask !== null &&
		usersTask.currentTask !== null &&
		usersTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
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

	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Shayzien, 100);
	if (!hasFavour && monster.id === Monsters.LizardmanShaman.id) {
		return `${user.minionName} needs ${requiredPoints}% Shayzien Favour to kill Lizardman shamans.`;
	}

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

	timeToFinish /= 2;
	boosts.push('2x BSO Boost');

	if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

	if (monster.pohBoosts) {
		const [boostPercent, messages] = calcPOHBoosts(await getPOH(user.id), monster.pohBoosts);
		if (boostPercent > 0) {
			timeToFinish = reduceNumByPercent(timeToFinish, boostPercent);
			boosts.push(messages.join(' + '));
		}
	}

	for (const [itemID, boostAmount] of Object.entries(resolveAvailableItemBoosts(user, monster))) {
		timeToFinish *= (100 - boostAmount) / 100;
		boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
	}

	if (user.usingPet('Gregoyle') && [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id].includes(monster.id)) {
		timeToFinish = reduceNumByPercent(timeToFinish, 20);
		boosts.push('20% boost for Gregoyle');
	}
	if (user.hasEquipped('Dwarven warhammer') && !monster.wildy) {
		timeToFinish = reduceNumByPercent(timeToFinish, 40);
		boosts.push('40% boost for Dwarven warhammer');
	}
	if (user.gear.wildy.hasEquipped(['Hellfire bow']) && monster.wildy) {
		timeToFinish /= 3;
		boosts.push('3x boost for Hellfire bow');
	}

	const monsterHP = osjsMon?.data.hitpoints ?? 100;
	const estimatedQuantity = floor(calcMaxTripLength(user, 'MonsterKilling') / timeToFinish);
	const totalMonsterHP = monsterHP * estimatedQuantity;

	// Removed vorkath because he has a special boost.
	if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
		if (
			user.hasEquippedOrInBank('Dragon hunter lance') &&
			!attackStyles.includes(SkillsEnum.Ranged) &&
			!attackStyles.includes(SkillsEnum.Magic)
		) {
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			boosts.push('20% for Dragon hunter lance');
		} else if (user.hasEquippedOrInBank('Dragon hunter crossbow') && attackStyles.includes(SkillsEnum.Ranged)) {
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			boosts.push('20% for Dragon hunter crossbow');
		}
	}

	// Black mask and salve don't stack.
	const oneSixthBoost = 16.67;
	let blackMaskBoost = 0;
	let blackMaskBoostMsg = '';
	let salveAmuletBoost = 0;
	let salveAmuletBoostMsg = '';

	// Calculate Slayer helmet boost on task if they have black mask or similar
	if (isOnTask && user.hasEquippedOrInBank('Infernal slayer helmet(i)')) {
		blackMaskBoost = 22;
		blackMaskBoostMsg = `${blackMaskBoost}% for Infernal slayer helmet(i) on task`;
	} else if (
		isOnTask &&
		user.hasEquippedOrInBank('Infernal slayer helmet') &&
		!attackStyles.includes(SkillsEnum.Ranged) &&
		!attackStyles.includes(SkillsEnum.Magic)
	) {
		blackMaskBoost = 17;
		blackMaskBoostMsg = `${blackMaskBoost}% for Infernal slayer helmet on melee task`;
	} else if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
		if (isOnTask && user.hasEquippedOrInBank('Black mask (i)')) {
			blackMaskBoost = oneSixthBoost;
			blackMaskBoostMsg = `${blackMaskBoost}% for Black mask (i) on non-melee task`;
		}
	} else if (isOnTask && user.hasEquippedOrInBank('Black mask')) {
		blackMaskBoost = oneSixthBoost;
		blackMaskBoostMsg = `${blackMaskBoost}% for Black mask on melee task`;
	}

	// Calculate Salve amulet boost on task if the monster is undead or similar
	const undeadMonster = osjsMon?.data?.attributes?.includes(MonsterAttribute.Undead);
	if (undeadMonster && (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic))) {
		if (user.hasEquippedOrInBank('Salve amulet(i)')) {
			const enhancedBoost = user.hasEquippedOrInBank('Salve amulet(ei)');
			salveAmuletBoost = enhancedBoost ? 20 : oneSixthBoost;
			salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${
				enhancedBoost ? '(ei)' : '(i)'
			} on non-melee task`;
		}
	} else if (undeadMonster && user.hasEquippedOrInBank('Salve amulet')) {
		const enhancedBoost = user.hasEquippedOrInBank('Salve amulet(e)');
		salveAmuletBoost = enhancedBoost ? 20 : oneSixthBoost;
		salveAmuletBoostMsg = `${salveAmuletBoost}% for Salve amulet${enhancedBoost ? ' (e)' : ''} on melee task`;
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

	// Initialize consumable costs before any are calculated.
	const consumableCosts: Consumable[] = [];

	// Calculate Cannon and Barrage boosts + costs:
	let usingCannon = false;
	let cannonMulti = false;
	let chinning = false;
	let burstOrBarrage = 0;
	const hasSuperiorCannon = user.owns('Superior dwarf multicannon');
	const hasCannon = cannonBanks.some(i => user.owns(i)) || hasSuperiorCannon;

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
	if (boostChoice === 'barrage' && user.skillLevel(SkillsEnum.Magic) < 94) {
		return `You need 94 Magic to use Ice Barrage. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	if (boostChoice === 'burst' && user.skillLevel(SkillsEnum.Magic) < 70) {
		return `You need 70 Magic to use Ice Burst. You have ${user.skillLevel(SkillsEnum.Magic)}`;
	}
	const { canAfford } = await canAffordInventionBoost(user, InventionID.SuperiorDwarfMultiCannon, timeToFinish);
	const canAffordSuperiorCannonBoost = hasSuperiorCannon ? canAfford : false;
	if (boostChoice === 'chinning' && user.skillLevel(SkillsEnum.Ranged) < 65) {
		return `You need 65 Ranged to use Chinning method. You have ${user.skillLevel(SkillsEnum.Ranged)}`;
	}

	if (
		boostChoice === 'cannon' &&
		!user.user.disabled_inventions.includes(InventionID.SuperiorDwarfMultiCannon) &&
		canAffordSuperiorCannonBoost &&
		(monster.canCannon || monster.cannonMulti)
	) {
		let qty = quantity || floor(maxTripLength / timeToFinish);
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

	const hasBlessing = user.hasEquipped('Dwarven blessing');
	const hasZealotsAmulet = user.hasEquipped('Amulet of zealots');
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
	const allGorajan = gorajanBoosts.every(e => user.gear[e[1]].hasEquipped(e[0], true));
	for (const [outfit, setup] of gorajanBoosts) {
		if (
			allGorajan ||
			(gearstatToSetup.get(monster.attackStyleToUse) === setup && user.gear[setup].hasEquipped(outfit, true))
		) {
			boosts.push('10% for Gorajan');
			timeToFinish *= 0.9;
			break;
		}
	}

	if (attackStyles.includes(SkillsEnum.Ranged) && user.hasEquipped('Ranged master cape')) {
		timeToFinish *= 0.85;
		boosts.push('15% for Ranged master cape');
	} else if (attackStyles.includes(SkillsEnum.Magic) && user.hasEquipped('Magic master cape')) {
		timeToFinish *= 0.85;
		boosts.push('15% for Magic master cape');
	} else if (
		!attackStyles.includes(SkillsEnum.Magic) &&
		!attackStyles.includes(SkillsEnum.Ranged) &&
		user.hasEquipped('Attack master cape')
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
				const degItem = degradeableItemsCanUse.find(i => i.item.id === equippedInThisSet.itemID)!;
				boosts.push(`${equippedInThisSet.boostPercent}% for ${itemNameFromID(equippedInThisSet.itemID)}`);
				timeToFinish = reduceNumByPercent(timeToFinish, equippedInThisSet.boostPercent);
				const estimatedChargesNeeded = Math.ceil(
					degItem.charges(monster, osjsMon!, totalMonsterHP, Time.Minute * 30, user)
				);
				const result = await checkUserCanUseDegradeableItem({
					item: getOSItem(equippedInThisSet.itemID),
					chargesToDegrade: estimatedChargesNeeded,
					user
				});
				if (!result.hasEnough) {
					return result.userMessage;
				}
				degItemBeingUsed.push(degItem);
			}
		}
	} else {
		for (const degItem of degradeableItemsCanUse) {
			const isUsing =
				convertPvmStylesToGearSetup(attackStyles).includes(degItem.attackStyle) &&
				user.gear[degItem.attackStyle].hasEquipped(degItem.item.id);
			if (isUsing) {
				const estimatedChargesNeeded = Math.ceil(
					degItem.charges(monster, osjsMon!, totalMonsterHP, Time.Minute * 30, user)
				);
				await checkUserCanUseDegradeableItem({
					item: degItem.item,
					chargesToDegrade: estimatedChargesNeeded,
					user
				});
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
	let duration = timeToFinish * quantity;

	// If you have dwarven blessing, you need 1 prayer pot per 5 mins
	const prayerPots = user.bank.amount('Prayer potion(4)');
	const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
	let prayerPotsNeeded = Math.max(1, fiveMinIncrements);
	const hasPrayerMasterCape = user.hasEquipped('Prayer master cape');
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

	quantity = Math.max(1, quantity);
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
			if (consumable.alternativeConsumables && !user.owns(consumable.itemCost)) {
				for (const c of consumable.alternativeConsumables) {
					if (user.owns(c.itemCost)) {
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
	// Check food
	let foodStr: string = '';
	// Find best eatable boost and add 1% extra
	const noFoodBoost = Math.floor(Math.max(...Eatables.map(eatable => eatable.pvmBoost ?? 0)) + 1);
	if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
		const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, user);
		foodStr += foodMessages;

		let gearToCheck: GearSetupType = convertAttackStyleToGearSetup(monster.attackStyleToUse);
		if (monster.wildy) gearToCheck = 'wildy';

		try {
			const { foodRemoved, reductions, reductionRatio } = await removeFoodFromUser({
				user,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				attackStylesUsed: monster.wildy
					? ['wildy']
					: uniqueArr([...objectKeys(monster.minimumGearRequirements ?? {}), gearToCheck]),
				learningPercentage: percentReduced
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

	for (const degItem of degItemBeingUsed) {
		const chargesNeeded = degItem.charges(monster, osjsMon!, monsterHP * quantity, duration, user);
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
	const rangeSetup = { ...user.gear.range.raw() };
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
		usedDart = true;
		await userStatsUpdate(user.id, () => ({
			death_touched_darts_used: {
				increment: 1
			}
		}));
	}
	if (monster.name === 'Koschei the deathless') {
		return 'You send your minion off to fight Koschei, before they even get close, they feel an immense, powerful fear and return back.';
	}

	let wildyPeak = null;
	let pkString = '';
	let thePkCount = 0;
	let hasDied = false;
	let hasWildySupplies = undefined;

	if (monster.canBePked) {
		const date = new Date().getTime();
		const cachedPeakInterval: Peak[] = globalClient._peakIntervalCache;
		for (const peak of cachedPeakInterval) {
			if (peak.startTime < date && peak.finishTime > date) {
				wildyPeak = peak;
				break;
			}
		}
		if (wildyPeak?.peakTier === PeakTier.High) {
			if (interaction) {
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to kill ${monster.name} during high peak time? PKers are more active.`
				);
			}
		}

		const antiPKSupplies = new Bank()
			.add('Saradomin brew(4)', Math.max(1, Math.floor(duration / (4 * Time.Minute))))
			.add('Super restore(4)', Math.max(1, Math.floor(duration / (8 * Time.Minute))))
			.add('Cooked karambwan', Math.max(1, Math.floor(duration / (4 * Time.Minute))));
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
			pkString += `Your minion brought ${antiPKSupplies} to survive potential pkers. (Handed back after trip if lucky)\n`;
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

	if (lootToRemove.length > 0) {
		updateBankSetting('economyStats_PVMCost', lootToRemove);
		await user.specialRemoveItems(lootToRemove);
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
		duration,
		type: 'MonsterKilling',
		usingCannon: !usingCannon ? undefined : usingCannon,
		cannonMulti: !cannonMulti ? undefined : cannonMulti,
		chinning: !chinning ? undefined : chinning,
		burstOrBarrage: !burstOrBarrage ? undefined : burstOrBarrage,
		died: !hasDied ? undefined : hasDied,
		pkEncounters: !thePkCount ? undefined : thePkCount,
		hasWildySupplies: !hasWildySupplies ? undefined : hasWildySupplies
	});

	if (usedDart) {
		return `<:deathtouched_dart:822674661967265843> ${user.minionName} used a **Deathtouched dart**.`;
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

	return response;
}

export async function monsterInfo(user: MUser, name: string): CommandResponse {
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
		)} and (${formatDuration(max)})\nIf the Weekend boost is active, it takes: (${formatDuration(
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

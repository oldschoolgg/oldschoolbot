import {
	calcPercentOfNum,
	calcWhatPercent,
	increaseNumByPercent,
	objectKeys,
	reduceNumByPercent,
	round,
	Time,
	uniqueArr
} from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import Monster from 'oldschooljs/dist/structures/Monster';
import { addArrayOfNumbers, itemID } from 'oldschooljs/dist/util';

import { PvMMethod } from '../../../lib/constants';
import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../../../lib/data/CollectionsExport';
import { Eatables } from '../../../lib/data/eatables';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { checkUserCanUseDegradeableItem, degradeItem } from '../../../lib/degradeableItems';
import { GearSetupType } from '../../../lib/gear';
import {
	boostCannon,
	boostCannonMulti,
	boostIceBarrage,
	boostIceBurst,
	cannonMultiConsumables,
	cannonSingleConsumables,
	CombatCannonItemBank,
	CombatOptionsEnum,
	iceBarrageConsumables,
	iceBurstConsumables,
	SlayerActivityConstants
} from '../../../lib/minions/data/combatConstants';
import { revenantMonsters } from '../../../lib/minions/data/killableMonsters/revs';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { AttackStyles, calculateMonsterFood, resolveAttackStyles } from '../../../lib/minions/functions';
import reducedTimeFromKC from '../../../lib/minions/functions/reducedTimeFromKC';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import { Consumable, KillableMonster } from '../../../lib/minions/types';
import { calcPOHBoosts } from '../../../lib/poh';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../../lib/types/minions';
import {
	convertAttackStyleToGearSetup,
	formatDuration,
	formatMissingItems,
	isWeekend,
	itemNameFromID,
	randomVariation,
	stringMatches,
	updateBankSetting
} from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import findMonster from '../../../lib/util/findMonster';
import getOSItem from '../../../lib/util/getOSItem';
import { sendToChannelID } from '../../../lib/util/webhook';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { igneCommand } from './igneCommand';
import { kgCommand } from './kgCommand';
import { kkCommand } from './kkCommand';
import { nexCommand } from './nexCommand';
import { nightmareCommand } from './nightmareCommand';
import { getPOH } from './pohCommand';
import { revsCommand } from './revsCommand';
import { temporossCommand } from './temporossCommand';
import { vasaCommand } from './vasaCommand';
import { zalcanoCommand } from './zalcanoCommand';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

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

const degradeableItemsCanUse = [
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
	}
];

function applySkillBoost(user: KlasaUser, duration: number, styles: AttackStyles[]): [number, string] {
	const skillTotal = addArrayOfNumbers(styles.map(s => user.skillLevel(s)));

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
	interaction: SlashCommandInteraction,
	user: KlasaUser,
	channelID: bigint,
	name: string,
	quantity: number | undefined,
	method: PvMMethod | undefined
) {
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
	if (name.toLowerCase().includes('ignecarus')) return igneCommand(interaction, user, channelID, name);
	if (name.toLowerCase().includes('goldemar')) return kgCommand(interaction, user, channelID, name);
	if (name.toLowerCase().includes('kalphite king')) return kkCommand(interaction, user, channelID, name);
	if (name.toLowerCase().includes('nex')) return nexCommand(interaction, user, channelID, name);

	if (revenantMonsters.some(i => i.aliases.some(a => stringMatches(a, name)))) {
		const mUser = await mahojiUsersSettingsFetch(user.id);
		return revsCommand(user, mUser, channelID, interaction, name);
	}

	const monster = findMonster(name);
	if (!monster) return invalidMonsterMsg;

	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.assignedTask !== null &&
		usersTask.currentTask !== null &&
		usersTask.assignedTask.monsters.includes(monster.id);

	if (monster.slayerOnly && !isOnTask) {
		return `You can't kill ${monster.name}, because you're not on a slayer task.`;
	}

	// Set chosen boost based on priority:
	const myCBOpts = user.settings.get(UserSettings.CombatOptions);
	const boostChoice = determineBoostChoice({
		cbOpts: myCBOpts as CombatOptionsEnum[],
		user,
		monster,
		method,
		isOnTask
	});

	// Check requirements
	const [hasReqs, reason] = user.hasMonsterRequirements(monster);
	if (!hasReqs) return reason ?? "You don't have the requirements to fight this monster";

	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Shayzien, 100);
	if (!hasFavour && monster.id === Monsters.LizardmanShaman.id) {
		return `${user.minionName} needs ${requiredPoints}% Shayzien Favour to kill Lizardman shamans.`;
	}

	let [timeToFinish, percentReduced] = reducedTimeFromKC(monster, user.getKC(monster.id));

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

	for (const [itemID, boostAmount] of Object.entries(user.resolveAvailableItemBoosts(monster))) {
		timeToFinish *= (100 - boostAmount) / 100;
		boosts.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
	}

	if (user.usingPet('Gregoyle') && [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id].includes(monster.id)) {
		timeToFinish = reduceNumByPercent(timeToFinish, 20);
		boosts.push('20% boost for Gregoyle');
	}
	if (user.hasItemEquippedAnywhere('Dwarven warhammer') && !monster.wildy) {
		timeToFinish = reduceNumByPercent(timeToFinish, 40);
		boosts.push('40% boost for Dwarven warhammer');
	}
	if (user.getGear('wildy').hasEquipped(['Hellfire bow']) && monster.wildy) {
		timeToFinish /= 3;
		boosts.push('3x boost for Hellfire bow');
	}

	const monsterHP = osjsMon?.data.hitpoints ?? 100;
	const estimatedQuantity = floor(user.maxTripLength('MonsterKilling') / timeToFinish);
	const totalMonsterHP = monsterHP * estimatedQuantity;

	/**
	 *
	 * Degradeable Items
	 *
	 */
	const degItemBeingUsed = [];
	for (const degItem of degradeableItemsCanUse) {
		const isUsing =
			monster.attackStyleToUse &&
			convertAttackStyleToGearSetup(monster.attackStyleToUse) === degItem.attackStyle &&
			user.getGear(degItem.attackStyle).hasEquipped(degItem.item.id);
		if (isUsing) {
			const estimatedChargesNeeded = degItem.charges(monster, osjsMon!, totalMonsterHP);
			await checkUserCanUseDegradeableItem({
				item: degItem.item,
				chargesToDegrade: estimatedChargesNeeded,
				user
			});
			degItemBeingUsed.push(degItem);
		}
	}

	// Removed vorkath because he has a special boost.
	if (monster.name.toLowerCase() !== 'vorkath' && osjsMon?.data?.attributes?.includes(MonsterAttribute.Dragon)) {
		if (
			user.hasItemEquippedOrInBank('Dragon hunter lance') &&
			!attackStyles.includes(SkillsEnum.Ranged) &&
			!attackStyles.includes(SkillsEnum.Magic)
		) {
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			boosts.push('20% for Dragon hunter lance');
		} else if (user.hasItemEquippedOrInBank('Dragon hunter crossbow') && attackStyles.includes(SkillsEnum.Ranged)) {
			timeToFinish = reduceNumByPercent(timeToFinish, 20);
			boosts.push('20% for Dragon hunter crossbow');
		}
	}

	// Black mask and salve don't stack.
	const salveBoost = boosts.join('').toLowerCase().includes('salve amulet');
	if (!salveBoost) {
		// Add 15% slayer boost on task if they have black mask or similar
		if (isOnTask && user.hasItemEquippedOrInBank('Infernal slayer helmet(i)')) {
			timeToFinish = reduceNumByPercent(timeToFinish, 22);
			boosts.push('22% for Infernal slayer helmet(i) on task');
		} else if (
			isOnTask &&
			user.hasItemEquippedOrInBank('Infernal slayer helmet') &&
			!attackStyles.includes(SkillsEnum.Ranged) &&
			!attackStyles.includes(SkillsEnum.Magic)
		) {
			timeToFinish = reduceNumByPercent(timeToFinish, 17);
			boosts.push('17% for Infernal slayer helmet on task');
		} else if (attackStyles.includes(SkillsEnum.Ranged) || attackStyles.includes(SkillsEnum.Magic)) {
			if (isOnTask && user.hasItemEquippedOrInBank('Black mask (i)')) {
				timeToFinish = reduceNumByPercent(timeToFinish, 15);
				boosts.push('15% for Black mask (i) on non-melee task');
			}
		} else if (
			isOnTask &&
			(user.hasItemEquippedOrInBank('Black mask') || user.hasItemEquippedOrInBank('Black mask (i)'))
		) {
			timeToFinish = reduceNumByPercent(timeToFinish, 15);
			boosts.push('15% for Black mask on melee task');
		}
	}

	// Initialize consumable costs before any are calculated.
	const consumableCosts: Consumable[] = [];

	// Calculate Cannon and Barrage boosts + costs:
	let usingCannon = false;
	let cannonMulti = false;
	let burstOrBarrage = 0;
	const hasCannon = user.owns(CombatCannonItemBank);
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

	if (boostChoice === 'barrage' && attackStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
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
	}

	const maxTripLength = user.maxTripLength('MonsterKilling');

	const hasBlessing = user.hasItemEquippedAnywhere('Dwarven blessing');
	const hasZealotsAmulet = user.hasItemEquippedAnywhere('Amulet of zealots');
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
	const allGorajan = gorajanBoosts.every(e => user.getGear(e[1]).hasEquipped(e[0], true));
	for (const [outfit, setup] of gorajanBoosts) {
		if (
			allGorajan ||
			(gearstatToSetup.get(monster.attackStyleToUse) === setup && user.getGear(setup).hasEquipped(outfit, true))
		) {
			boosts.push('10% for Gorajan');
			timeToFinish *= 0.9;
			break;
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
			user.settings.get(UserSettings.Slayer.SlayerUnlocks).includes(SlayerTaskUnlocksEnum.DoubleTrouble)
		) {
			effectiveQtyRemaining = Math.ceil(effectiveQtyRemaining / 2);
		}
		quantity = Math.min(quantity, effectiveQtyRemaining);
	}
	let duration = timeToFinish * quantity;

	// If you have dwarven blessing, you need 1 prayer pot per 5 mins
	const prayerPots = user.bank().amount('Prayer potion(4)');
	const fiveMinIncrements = Math.ceil(duration / (Time.Minute * 5));
	let prayerPotsNeeded = Math.max(1, fiveMinIncrements);
	const hasPrayerMasterCape = user.hasItemEquippedAnywhere('Prayer master cape');
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

	const infiniteWaterRunes = user.hasItemEquippedAnywhere(getSimilarItems(itemID('Staff of water')));
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
					if (user.hasItemEquippedAnywhere('Kodai wand')) {
						itemMultiple = Math.ceil(0.85 * itemMultiple);
					} else if (user.hasItemEquippedAnywhere('Staff of the dead')) {
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
		const fits = user.bank({ withGP: true }).fits(perKillCost);
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
	if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
		const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, user);
		foodStr += foodMessages;

		let gearToCheck: GearSetupType = convertAttackStyleToGearSetup(monster.attackStyleToUse);
		if (monster.wildy) gearToCheck = 'wildy';

		try {
			const { foodRemoved, reductions } = await removeFoodFromUser({
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
				boosts.push('4% for no food');
				duration = reduceNumByPercent(duration, 4);
			} else {
				for (const [item, qty] of foodRemoved.items()) {
					const eatable = Eatables.find(e => e.id === item.id);
					if (!eatable) continue;

					const healAmount =
						typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(user);
					const amountHealed = qty * healAmount;
					if (amountHealed < calcPercentOfNum(75, healAmountNeeded * quantity)) continue;
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
	}

	// Boosts that don't affect quantity:
	duration = randomVariation(duration, 3);

	for (const degItem of degItemBeingUsed) {
		const chargesNeeded = degItem.charges(monster, osjsMon!, monsterHP * quantity);
		await degradeItem({
			item: degItem.item,
			chargesToDegrade: chargesNeeded,
			user
		});
		boosts.push(`${degItem.boost}% for ${degItem.item.name}`);
		duration = reduceNumByPercent(duration, degItem.boost);
	}

	if (isWeekend()) {
		boosts.push('10% for Weekend');
		duration *= 0.9;
	}

	if (attackStyles.includes(SkillsEnum.Ranged) && user.hasItemEquippedAnywhere('Ranged master cape')) {
		duration *= 0.85;
		boosts.push('15% for Ranged master cape');
	} else if (attackStyles.includes(SkillsEnum.Magic) && user.hasItemEquippedAnywhere('Magic master cape')) {
		duration *= 0.85;
		boosts.push('15% for Magic master cape');
	} else if (user.hasItemEquippedAnywhere('Attack master cape')) {
		duration *= 0.85;
		boosts.push('15% for Attack master cape');
	}
	if (hasBlessing && prayerPotsNeeded) {
		const prayerPotsBank = new Bank().add('Prayer potion(4)', prayerPotsNeeded);
		totalCost.add(prayerPotsBank);
		await user.removeItemsFromBank(prayerPotsBank);
	}
	const rangeSetup = { ...user.getGear('range').raw() };
	let usedDart = false;
	if (rangeSetup.weapon?.item === itemID('Deathtouched dart')) {
		duration = 1;
		if (rangeSetup.weapon.quantity > 1) {
			rangeSetup.weapon.quantity--;
		} else {
			rangeSetup.weapon = null;
		}
		await user.settings.update(UserSettings.Gear.Range, rangeSetup);
		if (monster.name === 'Koschei the deathless') {
			return (
				'You send your minion off to fight Koschei with a Deathtouched dart, they stand a safe distance and throw the dart - Koschei immediately locks' +
				' eyes with your minion and grabs the dart mid-air, and throws it back, killing your minion instantly.'
			);
		}
		usedDart = true;
	}
	if (monster.name === 'Koschei the deathless') {
		return 'You send your minion off to fight Koschei, before they even get close, they feel an immense, powerful fear and return back.';
	}

	if (lootToRemove.length > 0) {
		updateBankSetting(globalClient, ClientSettings.EconomyStats.PVMCost, lootToRemove);
		await user.removeItemsFromBank(lootToRemove);
		totalCost.add(lootToRemove);
	}

	if (totalCost.length > 0) {
		await trackLoot({
			id: monster.name,
			cost: totalCost,
			type: 'Monster',
			changeType: 'cost'
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
		burstOrBarrage: !burstOrBarrage ? undefined : burstOrBarrage
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

	return response;
}

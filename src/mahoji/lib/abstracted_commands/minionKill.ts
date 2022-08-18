import { combats_enum } from '@prisma/client';
import { calcPercentOfNum, objectKeys, reduceNumByPercent, round, Time, uniqueArr } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank, Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { itemID } from 'oldschooljs/dist/util';

import { PvMMethod } from '../../../lib/constants';
import { Eatables } from '../../../lib/data/eatables';
import { getSimilarItems } from '../../../lib/data/similarItems';
import { GearSetupType } from '../../../lib/gear';
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
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { calculateMonsterFood, resolveCombatStyles } from '../../../lib/minions/functions';
import combatCalculator from '../../../lib/minions/functions/combatCalculator';
import removeAmmoFromUser from '../../../lib/minions/functions/removeAmmoFromUser';
import removeFoodFromUser from '../../../lib/minions/functions/removeFoodFromUser';
import removePotionsFromUser from '../../../lib/minions/functions/removePotionsFromUser';
import removePrayerFromUser from '../../../lib/minions/functions/removePrayerFromUser';
import removeRunesFromUser from '../../../lib/minions/functions/removeRunesFromUser';
import { Consumable } from '../../../lib/minions/types';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SlayerTaskUnlocksEnum } from '../../../lib/slayer/slayerUnlocks';
import { determineBoostChoice, getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { MonsterActivityTaskOptions } from '../../../lib/types/minions';
import {
	convertCombatStyleToGearSetup,
	formatDuration,
	formatMissingItems,
	stringMatches,
	updateBankSetting
} from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import findMonster from '../../../lib/util/findMonster';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';
import { GearStat } from './../../../lib/gear/types';
import { nexCommand } from './nexCommand';
import { nightmareCommand } from './nightmareCommand';
import { revsCommand } from './revsCommand';
import { temporossCommand } from './temporossCommand';
import { wintertodtCommand } from './wintertodtCommand';
import { zalcanoCommand } from './zalcanoCommand';

const invalidMonsterMsg = "That isn't a valid monster.\n\nFor example, `/k name:zulrah quantity:5`";

const { floor } = Math;

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

	if (stringMatches(name, 'nex')) return nexCommand(interaction, user, channelID);
	if (stringMatches(name, 'zalcano')) return zalcanoCommand(user, channelID);
	if (stringMatches(name, 'tempoross')) return temporossCommand(user, channelID, quantity);
	if (name.toLowerCase().includes('nightmare')) return nightmareCommand(user, channelID, name);
	if (name.toLowerCase().includes('wintertodt')) return wintertodtCommand(user, channelID);

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

	if (monster.immuneToCombatSkills) {
		for (let cs of monster.immuneToCombatSkills) {
			if (cs.toString().toLowerCase() === user.settings.get(UserSettings.Minion.CombatSkill)) {
				return `${monster.name} can not be attacked using ${user.settings.get(
					UserSettings.Minion.CombatSkill
				)}`;
			}
		}
	}

	let noneCombat = false;
	let combatCalcInfo = undefined;
	let [combatDuration, hits, DPS, monsterKillSpeed, calcQuantity, totalPrayerDosesUsed, potsUsed] = [
		0,
		0,
		0,
		0,
		0,
		0,
		['']
	];

	if (monster.isConverted) {
		combatCalcInfo = await combatCalculator(monster, user, quantity);
		[combatDuration, hits, DPS, monsterKillSpeed, calcQuantity, totalPrayerDosesUsed, potsUsed] = combatCalcInfo;
		console.log(hits, 'hits')
		console.log(monsterKillSpeed, 'monsterKillSpeed')
		console.log(calcQuantity, 'calcQuant')
	} else {
		noneCombat = true;
		boosts.push('Monster NOT converted. NO combat');
	}
	if (combatDuration === 0 && hits === 0 && DPS === 0 && monsterKillSpeed === 0 && calcQuantity === 0) {
		boosts.push('NO combat, combatCalculator not Working');
		noneCombat = true;
	}

	let noneCombatTimeToFinish = monster.noneCombatCalcTimeToFinish;

	const [, , combatStyles] = resolveCombatStyles(user, {
		monsterID: monster.id,
		boostMethod: boostChoice
	});

	// Initialize consumable costs before any are calculated.
	const consumableCosts: Consumable[] = [];

	// Calculate Cannon and Barrage boosts + costs:
	let usingCannon = false;
	let cannonMulti = false;
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

	if (boostChoice === 'barrage' && combatStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBarrageConsumables);
		noneCombatTimeToFinish = reduceNumByPercent(noneCombatTimeToFinish, boostIceBarrage);
		boosts.push(`${boostIceBarrage}% for Ice Barrage`);
		burstOrBarrage = SlayerActivityConstants.IceBarrage;
	} else if (boostChoice === 'burst' && combatStyles.includes(SkillsEnum.Magic) && monster!.canBarrage) {
		consumableCosts.push(iceBurstConsumables);
		noneCombatTimeToFinish = reduceNumByPercent(noneCombatTimeToFinish, boostIceBurst);
		boosts.push(`${boostIceBurst}% for Ice Burst`);
		burstOrBarrage = SlayerActivityConstants.IceBurst;
	} else if (boostChoice === 'cannon' && hasCannon && monster!.cannonMulti) {
		usingCannon = true;
		cannonMulti = true;
		consumableCosts.push(cannonMultiConsumables);
		noneCombatTimeToFinish = reduceNumByPercent(noneCombatTimeToFinish, boostCannonMulti);
		boosts.push(`${boostCannonMulti}% for Cannon in multi`);
	} else if (boostChoice === 'cannon' && hasCannon && monster!.canCannon) {
		usingCannon = true;
		consumableCosts.push(cannonSingleConsumables);
		noneCombatTimeToFinish = reduceNumByPercent(noneCombatTimeToFinish, boostCannon);
		boosts.push(`${boostCannon}% for Cannon in singles`);
	}

	const maxTripLength = user.maxTripLength('MonsterKilling');

	// If no quantity provided, set it to the max.
	if (!quantity) {
		if ([Monsters.Skotizo.id].includes(monster.id)) {
			quantity = 1;
		} else {
			quantity = floor(maxTripLength / noneCombatTimeToFinish);
		}
	}

	let noneCombatDuration = noneCombatTimeToFinish * quantity;
	const mahojiUser = await mahojiUsersSettingsFetch(user.id,{minion_combatSkill: true});
	const combatSkill = mahojiUser.minion_combatSkill;

	if (
		noneCombatDuration * 2 < combatDuration ||
		combatSkill === combats_enum.nocombat ||
		noneCombat
	) {

		console.log(combatDuration)
		console.log(noneCombatDuration)
		boosts.push('NO combat, way too long combat duration');
		noneCombat = true;
		combatDuration = noneCombatDuration;
	} else {
		quantity = calcQuantity;
	}

	quantity = Math.max(1, quantity);

	if (quantity > 1 && combatDuration > maxTripLength && noneCombat) {
		return `${minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${monster.name} is ${floor(
			maxTripLength / noneCombatTimeToFinish
		)}.`;
	}
	if (combatDuration > maxTripLength * 1.5 && !noneCombat) {
		return `${minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for ${monster.name} is around ${Math.floor(
			maxTripLength / (monsterKillSpeed * 1.3)
		)} depending on RNGs.`;
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
				if (consumable.qtyPerMinute) multiply = (noneCombatTimeToFinish / Time.Minute) * itemMultiple;

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
			combatDuration = Math.floor(combatDuration * (fits / Number(quantity)));
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
			}, you need: ${formatMissingItems(consumableCosts, noneCombatTimeToFinish)} per kill.`;
		}
	}
	// Check food
	let foodStr: string = '';
	if (monster.healAmountNeeded && monster.attackStyleToUse && monster.attackStylesUsed) {
		const [healAmountNeeded, foodMessages] = calculateMonsterFood(monster, user);
		foodStr += foodMessages;

		let gearToCheck: GearSetupType = convertCombatStyleToGearSetup(monster.attackStyleToUse);
		if (monster.wildy) gearToCheck = 'wildy';

		try {
			const { foodRemoved, reductions } = await removeFoodFromUser({
				user,
				totalHealingNeeded: healAmountNeeded * quantity,
				healPerAction: Math.ceil(healAmountNeeded / quantity),
				activityName: monster.name,
				combatStylesUsed: monster.wildy
					? ['wildy']
					: uniqueArr([...objectKeys(monster.minimumGearRequirements ?? {}), gearToCheck])
			});

			if (foodRemoved.length === 0) {
			} else {
				for (const [item, qty] of foodRemoved.items()) {
					const eatable = Eatables.find(e => e.id === item.id);
					if (!eatable) continue;

					const healAmount =
						typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(user);
					const amountHealed = qty * healAmount;
					if (amountHealed < calcPercentOfNum(75, healAmountNeeded * quantity)) continue;
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

	if (!noneCombat) {
		if (
			user.settings.get(UserSettings.Minion.CombatSkill) === combats_enum.ranged ||
			(user.settings.get(UserSettings.Minion.CombatSkill) === combats_enum.auto &&
				monster.defaultStyleToUse === GearStat.AttackRanged)
		) {
			messages.push(`Removed ${await removeAmmoFromUser(user, hits)}`);
		}
		if (
			user.settings.get(UserSettings.Minion.CombatSkill) === combats_enum.magic ||
			(user.settings.get(UserSettings.Minion.CombatSkill) === combats_enum.auto &&
				monster.defaultStyleToUse === GearStat.AttackMagic)
		) {
			messages.push(`Removed ${await removeRunesFromUser(user, hits)}`);
		}
		const potionStr = await removePotionsFromUser(user, potsUsed, combatDuration);
		if (potionStr.includes('x')) {
			messages.push(`${await removePotionsFromUser(user, potsUsed, combatDuration)}`);
		}
		if (totalPrayerDosesUsed > 0) {
			messages.push(`${await removePrayerFromUser(user, totalPrayerDosesUsed)}`);
		}
	}

	await addSubTaskToActivityTask<MonsterActivityTaskOptions>({
		monsterID: monster.id,
		userID: user.id,
		channelID: channelID.toString(),
		noneCombat,
		quantity,
		duration: combatDuration,
		hits,
		type: 'MonsterKilling',
		usingCannon: !usingCannon ? undefined : usingCannon,
		cannonMulti: !cannonMulti ? undefined : cannonMulti,
		burstOrBarrage: !burstOrBarrage ? undefined : burstOrBarrage
	});

	let response = `${minionName} is now killing ${quantity}x ${monster.name}, it'll take around ${formatDuration(
		combatDuration
	)} to finish. Your DPS is ${round(DPS, 3)}. The average kill time is ${formatDuration(
		monsterKillSpeed
	)} (Without banking/mechanics/respawn).`;

	if (noneCombat) {
		response +=
			'\nNONE COMBAT TRIP due to bad gear/stats, monster not converted or minion none combat setting activated.';
	}

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

import { deepClone, reduceNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { getSimilarItems } from '../../../lib/data/similarItems';
import { trackLoot } from '../../../lib/lootTrack';
import { resolveAttackStyles } from '../../../lib/minions/functions';
import { SkillsEnum } from '../../../lib/skilling/types';
import { Skills } from '../../../lib/types';
import { formatDuration, formatMissingItems, hasSkillReqs, itemID } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import resolveItems from '../../../lib/util/resolveItems';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { maniacalMonkeyID } from '../../../tasks/minions/maniacalMonkeyActivity';
import { PvMMethod } from './../../../lib/constants';
import {
	chinningConsumables,
	iceBarrageConsumables,
	iceBurstConsumables
} from './../../../lib/minions/data/combatConstants';
import { Consumable } from './../../../lib/minions/types';
import { ManiacalMonkeyTaskOptions } from './../../../lib/types/minions';
import { applySkillBoost } from './minionKill';

export async function maniacalMonkeyCommand(
	user: MUser,
	channelID: string,
	quantity: number | undefined,
	method: PvMMethod | undefined
) {
	const { minionName } = user;

	const skillReqs: Skills = {
		hitpoints: 74,
		prayer: 74
	};

	if (!method) {
		method = 'none';
	}

	const [hasReqs] = hasSkillReqs(user, skillReqs);
	if (!hasReqs) {
		return `You not meet skill requirements, you need ${Object.entries(skillReqs)
			.map(([name, lvl]) => `${lvl} ${name}`)
			.join(', ')}.`;
	}
	const magicLevel = user.skillLevel('magic');
	const rangedLevel = user.skillLevel('ranged');
	if ((method === 'burst' || method === 'barrage') && magicLevel < 62) {
		return 'You need atleast 62 magic to train magic on Maniacal Monkeys.';
	} else if (method === 'chinning' && rangedLevel < 65) {
		return 'You need atleast 65 ranged to train ranged on Maniacal Monkeys.';
	}

	const { QP } = user;

	if (QP < 175) {
		return `Manical monkeys require **175 QP**, and you have ${QP} QP.\n`;
	}

	const [, , attackStyles] = resolveAttackStyles(user, {
		monsterID: maniacalMonkeyID
	});

	const boosts: string[] = [];

	let timeToFinish = 0.24 * Time.Minute;
	const maxTripLength = calcMaxTripLength(user, 'ManiacalMonkey');

	const FIVE_HOURS = Time.Hour * 5;
	const kc = Math.max(1, user.getKC(maniacalMonkeyID));
	// every five hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(kc / (FIVE_HOURS / timeToFinish)), 10);
	timeToFinish -= (timeToFinish * percentReduced) / 100;

	const [newTime, skillBoostMsg] = applySkillBoost(user, timeToFinish, attackStyles);

	timeToFinish = newTime;
	boosts.push(skillBoostMsg);

	if (percentReduced >= 1) boosts.push(`${percentReduced}% for KC`);

	// Initialize consumable costs before any are calculated.
	const consumableCosts: Consumable[] = [];

	// Calculate Chinning and Barrage boosts + costs:
	if (method === 'barrage' && attackStyles.includes(SkillsEnum.Magic)) {
		if (user.skillLevel(SkillsEnum.Magic) < 94) {
			return `You need 94 Magic to use Ice Barrage. You have ${user.skillLevel(SkillsEnum.Magic)}`;
		}
		if (user.hasEquippedOrInBank('Occult necklace')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Occult necklace');
		}
		if (user.hasEquippedOrInBank('Tormented bracelet')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Tormented bracelet');
		}
		if (user.hasEquippedOrInBank('Kodai wand')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Kodai wand');
		}
		if (user.hasEquippedOrInBank('Ancestral robe top')) {
			timeToFinish *= (100 - 3) / 100;
			boosts.push('3% for Ancestral robe top');
		}
		if (user.hasEquippedOrInBank('Ancestral robe bottom')) {
			timeToFinish *= (100 - 2) / 100;
			boosts.push('2% for Ancestral robe bottom');
		}
		consumableCosts.push(iceBarrageConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, 75);
		boosts.push('75% for Ice Barrage');
	} else if (method === 'burst' && attackStyles.includes(SkillsEnum.Magic)) {
		if (user.skillLevel(SkillsEnum.Magic) < 70) {
			return `You need 70 Magic to use Ice Burst. You have ${user.skillLevel(SkillsEnum.Magic)}`;
		}
		if (user.hasEquippedOrInBank('Occult necklace')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Occult necklace');
		}
		if (user.hasEquippedOrInBank('Tormented bracelet')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Tormented bracelet');
		}
		if (user.hasEquippedOrInBank('Kodai wand')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Kodai wand');
		}
		if (user.hasEquippedOrInBank('Ancestral robe top')) {
			timeToFinish *= (100 - 3) / 100;
			boosts.push('3% for Ancestral robe top');
		}
		if (user.hasEquippedOrInBank('Ancestral robe bottom')) {
			timeToFinish *= (100 - 2) / 100;
			boosts.push('2% for Ancestral robe bottom');
		}
		consumableCosts.push(iceBurstConsumables);
		timeToFinish = reduceNumByPercent(timeToFinish, 67);
		boosts.push('67% for Ice Burst');
	} else if (method === 'chinning' && attackStyles.includes(SkillsEnum.Ranged)) {
		// Check what Chinchompa to use
		const chinchompas = ['Black chinchompa', 'Red chinchompa', 'Chinchompa'];
		let chinchompa = 'Black chinchompa';
		for (let chin of chinchompas) {
			if (user.owns(chin) && user.bank.amount(chin) > 5000) {
				chinchompa = chin;
				break;
			}
		}
		const regularVoid = resolveItems([
			'Void knight top',
			'Void knight robe',
			'Void knight gloves',
			'Void ranger helm'
		]);
		const eliteVoid = resolveItems(['Elite void top', 'Elite void robe', 'Void knight gloves', 'Void ranger helm']);
		if (user.hasEquippedOrInBank(eliteVoid, 'every')) {
			timeToFinish *= (100 - 10) / 100;
			boosts.push('10% for full Elite void equipment');
		} else if (user.hasEquippedOrInBank(regularVoid, 'every')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Void equipment');
		}
		if (user.hasEquippedOrInBank('Necklace of anguish')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Necklace of anguish');
		}
		if (user.hasEquippedOrInBank('Twisted buckler')) {
			timeToFinish *= (100 - 5) / 100;
			boosts.push('5% for Twisted buckler');
		}
		const chinBoostRapid = chinchompa === 'Chinchompa' ? 82 : chinchompa === 'Red chinchompa' ? 87 : 90;
		const chinBoostLongRanged = chinchompa === 'Chinchompa' ? 77 : chinchompa === 'Red chinchompa' ? 83 : 87;
		let chinConsumables = deepClone(chinningConsumables);
		// circular bad logic
		chinConsumables.itemCost.add(chinchompa, 1);
		if (attackStyles.includes(SkillsEnum.Defence)) {
			// Also bad circular logic
			chinConsumables.qtyPerMinute = 24;
			timeToFinish = reduceNumByPercent(timeToFinish, chinBoostLongRanged);
			boosts.push(`${chinBoostLongRanged}% for ${chinchompa}`);
		} else {
			timeToFinish = reduceNumByPercent(timeToFinish, chinBoostRapid);
			boosts.push(`${chinBoostRapid}% for ${chinchompa}`);
		}
		consumableCosts.push(chinConsumables);
	}

	// If no quantity provided, set it to the max.
	if (!quantity) {
		quantity = Math.floor(maxTripLength / timeToFinish);
	}
	quantity = Math.max(1, quantity);
	let duration = timeToFinish * quantity;

	if (duration > maxTripLength) {
		return `${minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for Maniacal Monkey is ${Math.floor(
			maxTripLength / timeToFinish
		)}.`;
	}

	const lootToRemove = new Bank();
	const totalCost = new Bank();
	let pvmCost = false;

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
			return `You don't have the items needed to kill any amount of Maniacal monkey, you need: ${formatMissingItems(
				consumableCosts,
				timeToFinish
			)} per kill.`;
		}
	}

	if (lootToRemove.length > 0) {
		updateBankSetting('economyStats_PVMCost', lootToRemove);
		await user.removeItemsFromBank(lootToRemove);
		totalCost.add(lootToRemove);
	}

	if (totalCost.length > 0) {
		updateBankSetting('mm_cost', totalCost);
		await trackLoot({
			id: maniacalMonkeyID.toString(),
			type: 'Monster',
			totalCost,
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost: totalCost
				}
			]
		});
	}

	await addSubTaskToActivityTask<ManiacalMonkeyTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'ManiacalMonkey',
		method
	});

	let response = `${minionName} is now killing ${quantity}x Maniacal Monkey, it'll take around ${formatDuration(
		duration
	)} to finish. Attack styles used: ${attackStyles.join(', ')}.`;

	if (pvmCost) {
		response += ` Removed ${totalCost}.`;
	}

	if (boosts.length > 0) {
		response += `\n**Boosts:** ${boosts.join(', ')}.`;
	}

	return response;
}

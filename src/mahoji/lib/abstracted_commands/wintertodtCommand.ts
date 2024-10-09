import { Time, calcWhatPercent, reduceNumByPercent } from 'e';
import { Bank } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { Eatables } from '../../../lib/data/eatables';
import { warmGear } from '../../../lib/data/filterables';
import { trackLoot } from '../../../lib/lootTrack';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export async function wintertodtCommand(user: MUser, channelID: string, quantity?: number) {
	const fmLevel = user.skillLevel(SkillsEnum.Firemaking);
	const wcLevel = user.skillLevel(SkillsEnum.Woodcutting);
	if (fmLevel < 50) {
		return 'You need 50 Firemaking to have a chance at defeating the Wintertodt.';
	}

	const messages = [];

	let durationPerTodt = Time.Minute * 7.3;

	// Up to a 10% boost for 99 WC
	const wcBoost = (wcLevel + 1) / 10;

	if (wcBoost > 1) {
		messages.push(`**Boosts:** ${wcBoost.toFixed(2)}% for Woodcutting level\n`);
	}

	durationPerTodt = reduceNumByPercent(durationPerTodt, wcBoost);

	const baseHealAmountNeeded = 20 * 8;
	let healAmountNeeded = baseHealAmountNeeded;
	let warmGearAmount = 0;

	for (const piece of warmGear) {
		if (user.gear.skilling.hasEquipped([piece])) {
			warmGearAmount++;
		}
		if (warmGearAmount >= 4) break;
	}

	healAmountNeeded -= warmGearAmount * 15;
	durationPerTodt = reduceNumByPercent(durationPerTodt, 5 * warmGearAmount);

	const maxTripLength = calcMaxTripLength(user, 'Wintertodt');
	if (!quantity) quantity = Math.floor(maxTripLength / durationPerTodt);
	quantity = Math.max(1, quantity);
	const duration = durationPerTodt * quantity;

	if (quantity > 1 && duration > maxTripLength) {
		return `${user.minionName} can't go on PvM trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount you can do for Wintertodt is ${Math.floor(
			maxTripLength / durationPerTodt
		)}.`;
	}

	for (const food of Eatables) {
		const healAmount = typeof food.healAmount === 'number' ? food.healAmount : food.healAmount(user.gearBank);
		const amountNeeded = Math.ceil(healAmountNeeded / healAmount) * quantity;
		if (user.bank.amount(food.id) < amountNeeded) {
			if (Eatables.indexOf(food) === Eatables.length - 1) {
				return `You don't have enough food to do Wintertodt! You can use these food items: ${Eatables.map(
					i => i.name
				).join(', ')}.`;
			}
			continue;
		}

		let foodStr = `**Food:** ${healAmountNeeded} HP/kill`;

		if (healAmountNeeded !== baseHealAmountNeeded) {
			foodStr += `. Reduced from ${baseHealAmountNeeded}, -${calcWhatPercent(
				baseHealAmountNeeded - healAmountNeeded,
				baseHealAmountNeeded
			)}% for wearing warm gear. `;
		} else {
			foodStr += '. ';
		}

		foodStr += ` **Removed ${amountNeeded}x ${food.name}**`;

		messages.push(foodStr);

		const cost = new Bank().add(food.id, amountNeeded);

		await user.removeItemsFromBank(cost);

		// Track this food cost in Economy Stats
		await updateBankSetting('economyStats_wintertodtCost', cost);

		// Track items lost
		await trackLoot({
			totalCost: cost,
			id: 'wintertodt',
			type: 'Minigame',
			changeType: 'cost',
			users: [
				{
					id: user.id,
					cost
				}
			]
		});

		break;
	}

	await addSubTaskToActivityTask<MinigameActivityTaskOptionsWithNoChanges>({
		minigameID: 'wintertodt',
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'Wintertodt'
	});

	return `${user.minionName} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
		durationPerTodt * quantity
	)}. (${formatDuration(durationPerTodt)} per Wintertodt)\n\n${messages.join('')}.`;
}

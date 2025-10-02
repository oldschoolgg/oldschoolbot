import { calcWhatPercent, formatDuration, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { Eatables } from '@/lib/data/eatables.js';
import { warmGear } from '@/lib/data/filterables.js';
import { trackLoot } from '@/lib/lootTrack.js';
import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function wintertodtCommand(user: MUser, channelID: string, quantity?: number) {
	const fmLevel = user.skillsAsLevels.firemaking;
	const wcLevel = user.skillsAsLevels.woodcutting;
	if (fmLevel < 50) {
		return 'You need 50 Firemaking to have a chance at defeating the Wintertodt.';
	}

	let durationPerTodt = Time.Minute * 7.3;

	// Up to a 10% boost for 99 WC
	const wcBoost = (wcLevel + 1) / 10;

	const boosts: string[] = [];
	const foodStr: string[] = [];

	if (wcBoost > 1) {
		boosts.push(`**Boosts:** ${wcBoost.toFixed(2)}% for Woodcutting level`);
	}

	if (user.hasEquippedOrInBank('Dwarven greataxe')) {
		durationPerTodt /= 2;
		boosts.push('2x faster for Dwarven greataxe.');
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

	const maxTripLength = user.calcMaxTripLength('Wintertodt');
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

		foodStr.push(`**Food:** ${healAmountNeeded} HP/kill`);

		if (healAmountNeeded !== baseHealAmountNeeded) {
			foodStr.push(
				`Reduced from ${baseHealAmountNeeded}, -${calcWhatPercent(
					baseHealAmountNeeded - healAmountNeeded,
					baseHealAmountNeeded
				)}% for wearing warm gear`
			);
		}

		const cost = new Bank().add(food.id, amountNeeded);

		foodStr.push(`**Removed ${cost}**`);

		await user.removeItemsFromBank(cost);

		// Track this food cost in Economy Stats
		await ClientSettings.updateBankSetting('economyStats_wintertodtCost', cost);

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

	await ActivityManager.startTrip<MinigameActivityTaskOptionsWithNoChanges>({
		minigameID: 'wintertodt',
		userID: user.id,
		channelID,
		quantity,
		duration,
		type: 'Wintertodt'
	});

	const str = `${
		user.minionName
	} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
		durationPerTodt * quantity
	)}. (${formatDuration(durationPerTodt)} per todt)\n\n${boosts.length > 0 ? `${boosts.join(', ')}\n` : ''}${
		foodStr.length > 0 ? foodStr.join(', ') : ''
	}.`;

	return str;
}

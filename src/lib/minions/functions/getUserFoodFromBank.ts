import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';
import type { GearBank } from '../../structures/GearBank';

function getRealHealAmount(gearBank: GearBank, healAmount: ((user: GearBank) => number) | number) {
	if (typeof healAmount === 'number') {
		return healAmount;
	}
	return healAmount(gearBank);
}

export default function getUserFoodFromBank({
	gearBank,
	totalHealingNeeded,
	favoriteFood,
	minimumHealAmount,
	isWilderness,
	unavailableBank
}: {
	gearBank: GearBank;
	totalHealingNeeded: number;
	favoriteFood: readonly number[];
	minimumHealAmount?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
}): false | Bank {
	let userBank = gearBank.bank;
	if (unavailableBank) userBank = userBank.clone().remove(unavailableBank);
	let totalHealingCalc = totalHealingNeeded;
	const foodToRemove = new Bank();

	let sorted = [...Eatables.filter(e => (isWilderness ? true : !e.wildyOnly))]
		.sort((i, j) =>
			getRealHealAmount(gearBank, i.healAmount) > getRealHealAmount(gearBank, j.healAmount) ? 1 : -1
		)
		.sort((k, l) => {
			if (isWilderness) {
				if (k.wildyOnly && !l.wildyOnly) return -1;
				if (!k.wildyOnly && l.wildyOnly) return 1;
			}
			return 0;
		})
		.sort((a, b) => {
			if (!userBank.has(a.id)) return 1;
			if (!userBank.has(b.id)) return -1;
			const aIsFav = favoriteFood.includes(a.id);
			const bIsFav = favoriteFood.includes(b.id);
			if (aIsFav && !bIsFav) return -1;
			if (!aIsFav && !bIsFav) return 0;
			if (!aIsFav && bIsFav) return 1;
			return 0;
		});

	if (minimumHealAmount) {
		sorted = sorted.filter(i =>
			typeof i.healAmount === 'number' ? i.healAmount : i.healAmount(gearBank) >= minimumHealAmount
		);
	}

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const healAmount = typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(gearBank);
		const amountOwned = userBank.amount(eatable.id);
		const amountNeededOfThisFood = Math.ceil(totalHealingCalc / healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= amountNeededOfThisFood) {
			totalHealingCalc -= Math.ceil(healAmount * amountNeededOfThisFood);
			foodToRemove.add(eatable.id, amountNeededOfThisFood);
			break;
		} else {
			totalHealingCalc -= Math.ceil(healAmount * amountOwned);
			foodToRemove.add(eatable.id, amountOwned);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

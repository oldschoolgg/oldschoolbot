import { Bank } from 'oldschooljs';
import { O } from 'ts-toolbelt';

import { Eatables } from '../../data/eatables';

export default function getUserFoodFromBank(
	userBank: O.Readonly<Bank>,
	totalHealingNeeded: number,
	favoriteFood: readonly number[]
): false | Bank {
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove = new Bank();

	const sorted = [...Eatables]
		.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))
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

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const amountOwned = userBank.amount(eatable.id);
		const toRemove = Math.ceil(totalHealingCalc / eatable.healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= toRemove) {
			totalHealingCalc -= Math.ceil(eatable.healAmount * toRemove);
			foodToRemove.add(eatable.id, toRemove);
			break;
		} else {
			totalHealingCalc -= Math.ceil(eatable.healAmount * amountOwned);
			foodToRemove.add(eatable.id, amountOwned);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

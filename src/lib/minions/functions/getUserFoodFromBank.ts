import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';

export default function getUserFoodFromBank(
	user: KlasaUser,
	totalHealingNeeded: number,
	favoriteFood: readonly number[],
	raw = false
): false | Bank {
	const userBank = user.bank();
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove = new Bank();

	const key = raw ? 'raw' : 'id';

	const sorted = [...Eatables]
		.filter(eat => (raw ? eat.raw !== null : true))
		.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))
		.sort((a, b) => {
			if (!userBank.has(a[key]!)) return 1;
			if (!userBank.has(b[key]!)) return -1;
			const aIsFav = favoriteFood.includes(a[key]!);
			const bIsFav = favoriteFood.includes(b[key]!);
			if (aIsFav && !bIsFav) return -1;
			if (!aIsFav && !bIsFav) return 0;
			if (!aIsFav && bIsFav) return 1;
			return 0;
		});

	if (favoriteFood.length) {
		sorted.sort((j, i) => (i.healAmount > j.healAmount ? 1 : -1));
	}

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const healAmount = typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(user);
		const amountOwned = userBank.amount(eatable.id);
		const toRemove = Math.ceil(totalHealingCalc / healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= toRemove) {
			totalHealingCalc -= Math.ceil(healAmount * toRemove);
			foodToRemove.add(eatable.id, toRemove);
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

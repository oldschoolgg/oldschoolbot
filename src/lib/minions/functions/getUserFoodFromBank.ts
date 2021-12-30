import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';

function getRealHealAmount(user: KlasaUser, healAmount: ((user: KlasaUser) => number) | number) {
	if (typeof healAmount === 'number') {
		return healAmount;
	}
	return healAmount(user);
}

export default function getUserFoodFromBank(
	user: KlasaUser,
	totalHealingNeeded: number,
	favoriteFood: readonly number[],
	minimumHealAmount?: number
): false | Bank {
	const userBank = user.bank();
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove = new Bank();

	let sorted = [...Eatables]
		.sort((i, j) => (getRealHealAmount(user, i.healAmount) > getRealHealAmount(user, j.healAmount) ? 1 : -1))
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
		sorted = sorted.filter(i => i.healAmount >= minimumHealAmount);
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

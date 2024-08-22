import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';

export function getRealHealAmount(user: MUser, healAmount: ((user: MUser) => number) | number) {
	if (typeof healAmount === 'number') {
		return healAmount;
	}
	return healAmount(user);
}

export default function getUserFoodFromBank({
	user,
	totalHealingNeeded,
	favoriteFood,
	minimumHealAmount,
	isWilderness,
	unavailableBank,
	raw
}: {
	user: MUser;
	totalHealingNeeded: number;
	favoriteFood: readonly number[];
	minimumHealAmount?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
	raw?: boolean;
}): false | Bank {
	let userBank = user.bank;
	if (unavailableBank) userBank = userBank.clone().remove(unavailableBank);
	let totalHealingCalc = totalHealingNeeded;
	const foodToRemove = new Bank();

	const key = raw ? 'raw' : 'id';
	let sorted = [...Eatables.filter(e => (isWilderness ? true : !e.wildyOnly))]
		.filter(eat => (raw ? eat.raw !== null : true))
		.sort((i, j) => (getRealHealAmount(user, i.healAmount) > getRealHealAmount(user, j.healAmount) ? 1 : -1))
		.sort((k, l) => {
			if (isWilderness) {
				if (k.wildyOnly && !l.wildyOnly) return -1;
				if (!k.wildyOnly && l.wildyOnly) return 1;
			}
			return 0;
		})
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

	if (minimumHealAmount) {
		sorted = sorted.filter(i => getRealHealAmount(user, i.healAmount) >= minimumHealAmount);
	}

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const id = raw ? eatable.raw : eatable.id;
		if (!id && raw) continue;
		const healAmount = typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(user);
		const amountOwned = userBank.amount(id!);
		const toRemove = Math.ceil(totalHealingCalc / healAmount);
		if (!amountOwned) continue;
		if (amountOwned >= toRemove) {
			totalHealingCalc -= Math.ceil(healAmount * toRemove);
			foodToRemove.add(id!, toRemove);
			break;
		} else {
			totalHealingCalc -= Math.ceil(healAmount * amountOwned);
			foodToRemove.add(id!, amountOwned);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

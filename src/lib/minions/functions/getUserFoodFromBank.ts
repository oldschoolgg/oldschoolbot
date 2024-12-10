import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';
import type { GearBank } from '../../structures/GearBank';

export function getRealHealAmount(gearBank: GearBank, healAmount: ((user: GearBank) => number) | number) {
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
	unavailableBank,
	raw
}: {
	gearBank: GearBank;
	totalHealingNeeded: number;
	favoriteFood: readonly number[];
	minimumHealAmount?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
	raw?: boolean;
}): false | Bank {
	let userBank = gearBank.bank;
	if (unavailableBank) userBank = userBank.clone().remove(unavailableBank);
	let totalHealingCalc = totalHealingNeeded;
	const foodToRemove = new Bank();

	const key = raw ? 'raw' : 'id';
	let sorted = [...Eatables.filter(e => (isWilderness ? true : !e.wildyOnly))]
		.filter(eat => (raw ? eat.raw !== null : true))
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
		sorted = sorted.filter(i =>
			typeof i.healAmount === 'number' ? i.healAmount : i.healAmount(gearBank) >= minimumHealAmount
		);
	}

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const id = raw ? eatable.raw : eatable.id;
		if (!id && raw) continue;
		const healAmount = getRealHealAmount(gearBank, eatable.healAmount);
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

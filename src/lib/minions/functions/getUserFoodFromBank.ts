import { Bank } from 'oldschooljs';

import { Eatables } from '../../data/eatables';

export function getRealHealAmount(
	skillsAsLevels: MUser['skillsAsLevels'],
	healAmount: ((skillsAsLevels: MUser['skillsAsLevels']) => number) | number
) {
	if (typeof healAmount === 'number') {
		return healAmount;
	}
	return healAmount(skillsAsLevels);
}

export default function getUserFoodFromBank({
	bank,
	skillsAsLevels,
	totalHealingNeeded,
	favoriteFood,
	minimumHealAmount,
	isWilderness,
	unavailableBank,
	raw
}: {
	bank: Bank;
	skillsAsLevels: MUser['skillsAsLevels'];
	totalHealingNeeded: number;
	favoriteFood: readonly number[];
	minimumHealAmount?: number;
	isWilderness?: boolean;
	unavailableBank?: Bank;
	raw?: boolean;
}): false | Bank {
	if (unavailableBank) bank = bank.clone().remove(unavailableBank);
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove = new Bank();

	const key = raw ? 'raw' : 'id';
	let sorted = [...Eatables.filter(e => (isWilderness ? true : !e.wildyOnly))]
		.filter(eat => (raw ? eat.raw !== null : true))
		.sort((i, j) =>
			getRealHealAmount(skillsAsLevels, i.healAmount) > getRealHealAmount(skillsAsLevels, j.healAmount) ? 1 : -1
		)
		.sort((k, l) => {
			if (isWilderness) {
				if (k.wildyOnly && !l.wildyOnly) return -1;
				if (!k.wildyOnly && l.wildyOnly) return 1;
			}
			return 0;
		})
		.sort((a, b) => {
			if (!bank.has(a[key]!)) return 1;
			if (!bank.has(b[key]!)) return -1;
			const aIsFav = favoriteFood.includes(a[key]!);
			const bIsFav = favoriteFood.includes(b[key]!);
			if (aIsFav && !bIsFav) return -1;
			if (!aIsFav && !bIsFav) return 0;
			if (!aIsFav && bIsFav) return 1;
			return 0;
		});

	if (minimumHealAmount) {
		sorted = sorted.filter(i => getRealHealAmount(skillsAsLevels, i.healAmount) >= minimumHealAmount);
	}

	// Gets all the eatables in the user bank
	for (const eatable of sorted) {
		const id = raw ? eatable.raw : eatable.id;
		if (!id && raw) continue;
		const healAmount =
			typeof eatable.healAmount === 'number' ? eatable.healAmount : eatable.healAmount(skillsAsLevels);
		const amountOwned = bank.amount(id!);
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

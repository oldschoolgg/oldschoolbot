import { KlasaUser } from 'klasa';
import { addBanks } from 'oldschooljs/dist/util';

import { Eatables } from '../../data/eatables';
import { UserSettings } from '../../settings/types/UserSettings';
import { Eatable } from '../../skilling/types';
import { ItemBank } from '../../types';

export default function getUserFoodFromBank(
	user: KlasaUser,
	totalHealingNeeded: number
): false | ItemBank {
	const userBank = user.settings.get(UserSettings.Bank);
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove: ItemBank = {};

	let eatables: Eatable[] = Eatables;

	// Gets all the eatables in the user bank
	for (const eatable of eatables.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))) {
		const inBank = userBank[eatable.id];
		const toRemove = Math.ceil(totalHealingCalc / eatable.healAmount);
		if (!inBank) continue;
		if (inBank >= toRemove) {
			totalHealingCalc -= Math.ceil(eatable.healAmount * toRemove);
			foodToRemove = addBanks([foodToRemove, { [eatable.id]: toRemove }]);
			break;
		} else {
			totalHealingCalc -= Math.ceil(eatable.healAmount * inBank);
			foodToRemove = addBanks([foodToRemove, { [eatable.id]: inBank }]);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

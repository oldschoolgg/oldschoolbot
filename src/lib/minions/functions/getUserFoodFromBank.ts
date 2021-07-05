import { KlasaUser } from 'klasa';
import { addBanks } from 'oldschooljs/dist/util';

import { Eatable, Eatables } from '../../data/eatables';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';

export default function getUserFoodFromBank(
	user: KlasaUser,
	totalHealingNeeded: number,
	raw = false
): false | ItemBank {
	const userBank = user.settings.get(UserSettings.Bank);
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove: ItemBank = {};

	let eatables: Eatable[] = Eatables;

	// Gets all the eatables in the user bank
	for (const _eatable of eatables
		.filter(eat => (raw ? eat.raw !== null : true))
		.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))) {
		const id = raw ? _eatable.raw! : _eatable.id;
		const inBank = userBank[id];
		const toRemove = Math.ceil(totalHealingCalc / _eatable.healAmount);
		if (!inBank) continue;
		if (inBank >= toRemove) {
			totalHealingCalc -= Math.ceil(_eatable.healAmount * toRemove);
			foodToRemove = addBanks([foodToRemove, { [id]: toRemove }]);
			break;
		} else {
			totalHealingCalc -= Math.ceil(_eatable.healAmount * inBank);
			foodToRemove = addBanks([foodToRemove, { [id]: inBank }]);
		}
	}
	// Check if qty is still above 0. If it is, it means the user doesn't have enough food.
	if (totalHealingCalc > 0) return false;
	return foodToRemove;
}

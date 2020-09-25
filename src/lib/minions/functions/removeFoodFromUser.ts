import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, removeBankFromBank } from 'oldschooljs/dist/util';
import { O } from 'ts-toolbelt';

import { Eatables } from '../../eatables';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { Bank, ItemBank } from '../../types';

export function getUserFoodFromBank(
	userBank: O.Readonly<Bank>,
	totalHealingNeeded: number
): false | ItemBank {
	let totalHealingCalc = totalHealingNeeded;
	let foodToRemove: Bank = {};
	// Gets all the eatables in the user bank
	for (const eatable of Eatables.sort((i, j) => (i.healAmount > j.healAmount ? 1 : -1))) {
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

export default async function removeFoodFromUser(
	client: KlasaClient,
	user: KlasaUser,
	totalHealingNeeded: number,
	healPerAction: number,
	activityName: string
) {
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);
	const foodToRemove = getUserFoodFromBank(userBank, totalHealingNeeded);
	if (!foodToRemove) {
		throw `You don't have enough food to kill ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per kill). You can use these food items: ${Eatables.map(
			i => i.name
		).join(', ')}.`;
	} else {
		await user.settings.update(UserSettings.Bank, removeBankFromBank(userBank, foodToRemove));
		await client.settings.update(
			ClientSettings.EconomyStats.PVMCost,
			addBanks([client.settings.get(ClientSettings.EconomyStats.PVMCost), foodToRemove])
		);
	}
}

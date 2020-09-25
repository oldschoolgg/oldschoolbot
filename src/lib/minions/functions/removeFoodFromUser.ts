import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, removeBankFromBank } from 'oldschooljs/dist/util';

import { Eatables } from '../../eatables';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import getUserFoodFromBank from './getUserFoodFromBank';

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

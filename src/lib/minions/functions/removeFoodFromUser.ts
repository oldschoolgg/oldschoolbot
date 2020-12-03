import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, removeBankFromBank } from 'oldschooljs/dist/util';

import { Eatables } from '../../eatables';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import getUserFoodFromBank from './getUserFoodFromBank';

export default async function removeFoodFromUser(
	client: KlasaClient,
	user: KlasaUser,
	totalHealingNeeded: number,
	healPerAction: number,
	activityName: string
): Promise<[string, ItemBank]> {
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);
	const foodToRemove = getUserFoodFromBank(userBank, totalHealingNeeded);
	if (!foodToRemove) {
		throw `You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
			i => i.name
		).join(', ')}.`;
	} else {
		await user.settings.update(UserSettings.Bank, removeBankFromBank(userBank, foodToRemove));
		await client.settings.update(
			ClientSettings.EconomyStats.PVMCost,
			addBanks([client.settings.get(ClientSettings.EconomyStats.PVMCost), foodToRemove])
		);
		return [
			`${await createReadableItemListFromBank(client, foodToRemove)} from ${user.username}`,
			foodToRemove
		];
	}
}

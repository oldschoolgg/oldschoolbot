import { objectEntries } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, itemID, removeBankFromBank } from 'oldschooljs/dist/util';

import { Emoji } from '../../constants';
import { Eatables } from '../../eatables';
import { GearSetupTypes } from '../../gear/types';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types';
import { reduceNumByPercent } from '../../util';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import getUserFoodFromBank from './getUserFoodFromBank';

export default async function removeFoodFromUser({
	client,
	user,
	totalHealingNeeded,
	healPerAction,
	activityName,
	attackStylesUsed
}: {
	client: KlasaClient;
	user: KlasaUser;
	totalHealingNeeded: number;
	healPerAction: number;
	activityName: string;
	attackStylesUsed: GearSetupTypes[];
}): Promise<[string, ItemBank]> {
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);

	const rawGear = user.rawGear();
	const gearSetupsUsed = objectEntries(rawGear).filter(entry =>
		attackStylesUsed.includes(entry[0])
	);
	const reductions = [];
	const elyUsed = gearSetupsUsed.some(
		entry => entry[1].shield?.item === itemID('Elysian spirit shield')
	);
	if (elyUsed) {
		totalHealingNeeded = reduceNumByPercent(totalHealingNeeded, 17.5);
		reductions.push(`17.5% for Ely ${Emoji.Ely}`);
	}
	const foodToRemove = getUserFoodFromBank(userBank, totalHealingNeeded);
	if (!foodToRemove) {
		throw `You don't have enough food to do ${activityName}! You need enough food to heal at least ${totalHealingNeeded} HP (${healPerAction} per action). You can use these food items: ${Eatables.map(
			i => i.name
		).join(', ')}.`;
	} else {
		await user.queueFn(() =>
			user.settings.update(UserSettings.Bank, removeBankFromBank(userBank, foodToRemove))
		);
		await client.settings.update(
			ClientSettings.EconomyStats.PVMCost,
			addBanks([client.settings.get(ClientSettings.EconomyStats.PVMCost), foodToRemove])
		);

		let reductionsStr = reductions.length > 0 ? ` (Reductions: ${reductions.join(', ')})` : '';
		return [
			`${await createReadableItemListFromBank(client, foodToRemove)} from ${
				user.username
			}${reductionsStr}`,
			foodToRemove
		];
	}
}

import { KlasaClient, KlasaUser } from 'klasa';
import { addBanks, bankHasItem } from 'oldschooljs/dist/util';

import { Time } from '../../constants';
import { UserSettings } from '../../settings/types/UserSettings';
import { ItemBank } from '../../types/index';
import { itemNameFromID } from '../../util';
import createReadableItemListFromBank from '../../util/createReadableItemListFromTuple';
import Potions from '../data/potions';

export default async function removePotionsFromUser(
	client: KlasaClient,
	user: KlasaUser,
	pots: string[],
	duration: number
): Promise<string> {
	const uniqPots = [...new Set(pots)];
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);

	// In future make pots be calculated on a per dose basis.
	const amountPotsToRemove = Math.max(Math.floor(duration / (Time.Minute * 30)), 1);
	let potsToRemove: ItemBank = {};

	for (const pot of uniqPots) {
		const selectedPotion = Potions.find(
			_potion => _potion.name.toLowerCase() === pot.toLowerCase()
		);
		if (!selectedPotion) continue;
		if (!bankHasItem(userBank, selectedPotion?.items[3])) {
			throw `You don't have enough ${itemNameFromID(selectedPotion.items[3])} in the bank.`;
		}
		potsToRemove = addBanks([potsToRemove, { [selectedPotion.items[3]]: amountPotsToRemove }]);
	}

	await user.removeItemsFromBank(potsToRemove);

	return `${await createReadableItemListFromBank(client, potsToRemove)} from ${user.username}`;
}

import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { bankHasItem } from 'oldschooljs/dist/util';

import { itemNameFromID } from '../../util';
import Potions from '../data/potions';

export default async function removePotionsFromUser(
	user: KlasaUser,
	pots: string[],
	duration: number
): Promise<string> {
	const uniqPots = [...new Set(pots)];
	await user.settings.sync(true);
	const userBank = user.bank().values();

	// In future make pots be calculated on a per dose basis.
	const amountPotsToRemove = Math.max(Math.floor(duration / (Time.Minute * 30)), 1);
	let potsToRemove = new Bank();

	for (const pot of uniqPots) {
		const selectedPotion = Potions.find(_potion => _potion.name.toLowerCase() === pot.toLowerCase());
		if (!selectedPotion) continue;
		if (!bankHasItem(userBank, selectedPotion?.items[3])) {
			throw `You don't have enough ${itemNameFromID(selectedPotion.items[3])} in the bank.`;
		}
		potsToRemove.add(selectedPotion.items[3], amountPotsToRemove);
	}

	await user.removeItemsFromBank(potsToRemove);

	return `Removed ${potsToRemove} from ${user.username}`;
}

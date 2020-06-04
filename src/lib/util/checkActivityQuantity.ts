import { KlasaUser } from 'klasa';

import { UserSettings } from '../settings/types/UserSettings';
import { ItemBank } from '../types';
import { formatDuration, itemNameFromID } from '../util';

export default function checkActivityQuantity(
	user: KlasaUser,
	quantity: undefined | number,
	timeForOneAction: number,
	requiredItems: ItemBank = {}
): number {
	const unownedItems: string[] = [];
	const presetQuant = quantity !== undefined;

	if (presetQuant && quantity! * timeForOneAction > user.maxTripLength) {
		throw `${user.minionName} can't go on trips longer than ${formatDuration(
			user.maxTripLength
		)}, try a lower quantity. The highest amount of this you can do is ${Math.floor(
			user.maxTripLength / timeForOneAction
		)}.`;
	}
	quantity = presetQuant ? quantity : Math.floor(user.maxTripLength / timeForOneAction);

	for (const [itemID, qty] of Object.entries(requiredItems)) {
		const id = parseInt(itemID);
		const qtyOwned =
			id === 995 ? user.settings.get(UserSettings.GP) : user.numItemsInBankSync(id);
		const qtyRequired = presetQuant ? qty * quantity! : qty;

		if (qtyOwned < qtyRequired) {
			unownedItems.push(`${itemNameFromID(id)}`);
		}
		quantity = presetQuant ? quantity : Math.min(quantity!, Math.floor(qtyOwned / qtyRequired));
	}

	if (unownedItems.length) {
		throw `You don't have enough ${unownedItems.join(', ')}.`;
	}

	return quantity!;
}

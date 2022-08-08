import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { bankHasItem } from 'oldschooljs/dist/util';

import { UserSettings } from '../../settings/types/UserSettings';
import itemID from '../../util/itemID';

export default async function removePrayerFromUser(
	user: KlasaUser,
	totalDosesUsed: number
): Promise<string> {
	await user.settings.sync(true);
	const userBank = user.settings.get(UserSettings.Bank);

	let potsToRemove = new Bank();

	if (
		!bankHasItem(
			userBank,
			itemID('Prayer potion(4)'),
			Math.floor(totalDosesUsed / 4) + 1
		) &&
		totalDosesUsed > 0
	) {
		throw "You don't have enough Prayer potion(4) in the bank.";
	}
	
	let str = '';
	if (totalDosesUsed > 0) {
		potsToRemove.add((itemID('Prayer potion(4)'), Math.floor(totalDosesUsed / 4) + 1));
		str += `Removed ${potsToRemove} from ${user.username}.`;
		const leftOverDoses = 4 - (totalDosesUsed % 4);
		if (leftOverDoses !== 4) {
			await user.addItemsToBank({
				items: new Bank().add(itemID(`Prayer potion(${leftOverDoses})`), 1),
				collectionLog: false
			});
			str += `\nReturned 1x Prayer potion(${leftOverDoses}) to the bank.`
		}
	}

	await user.removeItemsFromBank(potsToRemove);

	return str;
}
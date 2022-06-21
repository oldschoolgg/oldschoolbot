import { KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../settings/types/UserSettings';
import { itemNameFromID } from '../../util';
import { logError } from '../../util/logError';

export async function unequipPet(msg: KlasaMessage) {
	const equippedPet = msg.author.settings.get(UserSettings.Minion.EquippedPet);
	if (!equippedPet) return msg.channel.send("You don't have a pet equipped.");

	const loot = new Bank().add(equippedPet);

	try {
		await msg.author.addItemsToBank({ items: loot, collectionLog: false });
	} catch (e) {
		logError(new Error('Failed to add pet to bank'), {
			user_id: msg.author.id,
			pet_to_unequip: equippedPet.toString()
		});
		return msg.channel.send('Error removing pet, ask for help in the support server.');
	}
	await msg.author.settings.update(UserSettings.Minion.EquippedPet, null);

	return msg.channel.send(
		`${msg.author.minionName} picks up their ${itemNameFromID(equippedPet)} pet and places it back in their bank.`
	);
}

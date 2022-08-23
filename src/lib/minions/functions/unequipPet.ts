import { Bank } from 'oldschooljs';

import { UserSettings } from '../../settings/types/UserSettings';
import { itemNameFromID } from '../../util';
import { logError } from '../../util/logError';

export async function unequipPet(user: MUser) {
	const equippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
	if (!equippedPet) return "You don't have a pet equipped.";

	const loot = new Bank().add(equippedPet);

	try {
		await user.addItemsToBank({ items: loot, collectionLog: false });
	} catch (e) {
		logError(new Error('Failed to add pet to bank'), {
			user_id: user.id,
			pet_to_unequip: equippedPet.toString()
		});
		return 'Error removing pet, ask for help in the support server.';
	}
	await user.settings.update(UserSettings.Minion.EquippedPet, null);

	return `${user.minionName} picks up their ${itemNameFromID(equippedPet)} pet and places it back in their bank.`;
}

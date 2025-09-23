import { Bank, Items } from 'oldschooljs';

import { logError } from '@/lib/util/logError.js';

export async function unequipPet(user: MUser) {
	const equippedPet = user.user.minion_equippedPet;
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
	await user.update({
		minion_equippedPet: null
	});

	return `${user.minionName} picks up their ${Items.itemNameFromId(equippedPet)} pet and places it back in their bank.`;
}

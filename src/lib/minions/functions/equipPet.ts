import { Bank } from 'oldschooljs';

import { allPetIDs } from '../../data/CollectionsExport.js';
import { getItem } from '../../util/getOSItem.js';
import { unequipPet } from './unequipPet.js';

export async function equipPet(user: MUser, itemName: string) {
	const petItem = getItem(itemName);
	if (!petItem) return "That's not a valid item.";
	const cost = new Bank().add(petItem.id);

	if (!allPetIDs.includes(petItem.id) || !user.owns(cost)) {
		return "That's not a pet, or you do not own this pet.";
	}

	const currentlyEquippedPet = user.user.minion_equippedPet;
	if (currentlyEquippedPet) {
		await unequipPet(user);
	}

	const doubleCheckEquippedPet = user.user.minion_equippedPet;
	if (doubleCheckEquippedPet) {
		return 'You still have a pet equipped, cancelling.';
	}

	await user.update({
		minion_equippedPet: petItem.id
	});
	await user.transactItems({ itemsToRemove: cost });

	return `${user.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`;
}

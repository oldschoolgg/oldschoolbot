import { Bank } from 'oldschooljs';

import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';
import { allPetIDs } from '../../data/CollectionsExport';
import getOSItem from '../../util/getOSItem';
import { unequipPet } from './unequipPet';

export async function equipPet(user: MUser, itemName: string) {
	const petItem = getOSItem(itemName);
	const cost = new Bank().add(petItem.id);

	if (!allPetIDs.includes(petItem.id) || !user.bank.has(cost)) {
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

	await mahojiUserSettingsUpdate(user.id, {
		minion_equippedPet: petItem.id
	});
	await transactItems({ userID: user.id, itemsToRemove: cost });

	return `${user.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`;
}

import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { allPetIDs } from '../../data/CollectionsExport';
import { UserSettings } from '../../settings/types/UserSettings';
import getOSItem from '../../util/getOSItem';
import { unequipPet } from './unequipPet';

export async function equipPet(user: KlasaUser, itemName: string) {
	const petItem = getOSItem(itemName);
	const cost = new Bank().add(petItem.id);

	if (!allPetIDs.includes(petItem.id) || !user.owns(cost)) {
		return "That's not a pet, or you do not own this pet.";
	}

	const currentlyEquippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
	if (currentlyEquippedPet) {
		await unequipPet(user);
	}

	const doubleCheckEquippedPet = user.settings.get(UserSettings.Minion.EquippedPet);
	if (doubleCheckEquippedPet) {
		user.log(`Aborting pet equip so we don't clobber ${doubleCheckEquippedPet}`);
		return 'You still have a pet equipped, cancelling.';
	}

	await user.settings.update(UserSettings.Minion.EquippedPet, petItem.id);
	await transactItems({ userID: user.id, itemsToRemove: cost });

	user.log(`equipping ${petItem.name}[${petItem.id}]`);

	return `${user.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`;
}

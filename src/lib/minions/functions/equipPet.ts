import { Bank, Items } from 'oldschooljs';

import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import { unequipPet } from '@/lib/minions/functions/unequipPet.js';

export async function equipPet(user: MUser, itemName: string) {
	const petItem = Items.getItem(itemName);
	if (!petItem) return "That's not a valid item.";
	const cost = new Bank().add(petItem.id);

	if (petItem.name === 'Wubufu' && user.owns('Wubufu')) {
		return "🐳 You thought Wubufu was a pet? Wow that's a really good knock off... You haven't been dragging that poor thing on the ground, have you?";
	}

	if (!allPetIDs.includes(petItem.id) || !user.owns(cost)) {
		return "That's not a pet, or you do not own this pet.";
	}

	let unequipMsg = '';
	const currentlyEquippedPet = user.user.minion_equippedPet;
	if (currentlyEquippedPet) {
		unequipMsg = await unequipPet(user);
	}

	const doubleCheckEquippedPet = user.user.minion_equippedPet;
	if (doubleCheckEquippedPet) {
		return 'You still have a pet equipped, cancelling.';
	}

	await user.transactItems({
		itemsToRemove: cost,
		otherUpdates: {
			minion_equippedPet: petItem.id
		}
	});

	return `${unequipMsg}\n\n${user.minionName} takes their ${petItem.name} from their bank, and puts it down to follow them.`;
}

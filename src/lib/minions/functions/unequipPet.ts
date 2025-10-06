import { Bank, Items } from 'oldschooljs';

export async function unequipPet(user: MUser) {
	const equippedPet = user.user.minion_equippedPet;
	if (!equippedPet) return "You don't have a pet equipped.";

	const loot = new Bank().add(equippedPet);

	await user.addItemsToBank({ items: loot, collectionLog: false });

	await user.update({
		minion_equippedPet: null
	});

	return `${user.minionName} picks up their ${Items.itemNameFromId(equippedPet)} pet and places it back in their bank.`;
}

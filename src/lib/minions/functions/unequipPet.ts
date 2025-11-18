import { Bank, Items } from 'oldschooljs';

export async function unequipPet(user: MUser) {
	const equippedPet = user.user.minion_equippedPet;
	if (!equippedPet) return "You don't have a pet equipped.";
	if (await user.minionIsBusy()) return 'You cant unequip your pet while your minion is busy.';

	const loot = new Bank().add(equippedPet);

	await user.transactItems({
		itemsToAdd: loot,
		collectionLog: false,
		otherUpdates: {
			minion_equippedPet: null
		}
	});

	return `${user.minionName} picks up their ${Items.itemNameFromId(equippedPet)} pet and places it back in their bank.`;
}

import { Bank } from 'oldschooljs';

import decantPotionFromBank from '../../../lib/minions/functions/decantPotionFromBank';

export async function decantCommand(user: MUser, itemName: string, dose = 4) {
	if (![1, 2, 3, 4].includes(dose)) return 'Invalid dose number.';
	const res = decantPotionFromBank(user.bank, itemName, dose);
	if (res.error !== null) return res.error;
	const { potionsToAdd, sumOfPots, potionName, potionsToRemove } = res;

	if (!user.owns(potionsToRemove)) {
		return `You don't own ${potionsToRemove}.`;
	}

	await transactItems({
		userID: user.id,
		filterLoot: false,
		itemsToRemove: potionsToRemove,
		itemsToAdd: potionsToAdd
	});

	if (user.hasEquipped(['Iron dagger', 'Bronze arrow']) && !user.hasEquippedOrInBank('Clue hunter gloves')) {
		await user.addItemsToBank({ items: new Bank({ 'Clue hunter gloves': 1 }), collectionLog: true });
	}

	return `You decanted **${sumOfPots}x ${potionName}${sumOfPots > 0 ? 's' : ''}** into **${potionsToAdd}**.`;
}

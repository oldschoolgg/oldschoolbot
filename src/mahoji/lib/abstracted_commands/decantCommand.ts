import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import decantPotionFromBank from '../../../lib/minions/functions/decantPotionFromBank';

export async function decantCommand(user: KlasaUser, itemName: string, dose = 4) {
	if (![1, 2, 3, 4].includes(dose)) return 'Invalid dose number.';
	const res = decantPotionFromBank(user.bank(), itemName, dose);
	if (res.error !== null) return res.error;
	const { potionsToAdd, sumOfPots, potionName, potionsToRemove } = res;

	if (!user.owns(potionsToRemove)) {
		return `You don't own ${potionsToRemove}.`;
	}
	await user.removeItemsFromBank(potionsToRemove);
	await user.addItemsToBank({ items: potionsToAdd });

	if (
		user.hasItemEquippedAnywhere(['Iron dagger', 'Bronze arrow'], true) &&
		!user.hasItemEquippedOrInBank('Clue hunter gloves')
	) {
		await user.addItemsToBank({ items: new Bank({ 'Clue hunter gloves': 1 }), collectionLog: true });
	}

	return `You decanted **${sumOfPots}x ${potionName}${sumOfPots > 0 ? 's' : ''}** into **${potionsToAdd}**.`;
}

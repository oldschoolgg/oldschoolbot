import decantPotionFromBank from '../../../lib/minions/functions/decantPotionFromBank';
import { randomizeBank } from '../../../lib/randomizer';

export async function decantCommand(user: MUser, itemName: string, dose = 4) {
	if (![1, 2, 3, 4].includes(dose)) return 'Invalid dose number.';
	const res = decantPotionFromBank(user.bank, itemName, dose);
	if (res.error !== null) return res.error;
	const { potionsToAdd, sumOfPots, potionName, potionsToRemove } = res;

	if (!user.owns(potionsToRemove)) {
		return `You don't own ${potionsToRemove}.`;
	}
	await user.removeItemsFromBank(potionsToRemove);

	let loot = randomizeBank(user.id, potionsToAdd);
	await user.addItemsToBank({ items: loot });

	return `You decanted **${sumOfPots}x ${potionName}${sumOfPots > 0 ? 's' : ''}** into **${loot}**.`;
}

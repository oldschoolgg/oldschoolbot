import { Bank } from 'oldschooljs';

import decantPotionFromBank, { decantAllPotionsFromBank } from '@/lib/minions/functions/decantPotionFromBank.js';

async function giveClueHunterGlovesIfEligible(user: MUser) {
	if (user.hasEquipped(['Iron dagger', 'Bronze arrow']) && !user.hasEquippedOrInBank('Clue hunter gloves')) {
		await user.addItemsToBank({ items: new Bank({ 'Clue hunter gloves': 1 }), collectionLog: true });
	}
}

export async function decantCommand(user: MUser, itemName: string | undefined, dose = 4, decantAll = false) {
	if (![1, 2, 3, 4].includes(dose)) return 'Invalid dose number.';
	if (decantAll) return decantAllCommand(user, dose);
	if (!itemName) return 'You need to specify a potion, or choose the all option.';

	const res = decantPotionFromBank(user.bank, itemName, dose);
	if (res.error !== null) return res.error;
	const { potionsToAdd, sumOfPots, potionName, potionsToRemove } = res;

	if (!user.owns(potionsToRemove)) {
		return `You don't own ${potionsToRemove}.`;
	}

	await user.transactItems({
		filterLoot: false,
		itemsToRemove: potionsToRemove,
		itemsToAdd: potionsToAdd
	});

	await giveClueHunterGlovesIfEligible(user);

	return `You decanted **${sumOfPots}x ${potionName}${sumOfPots > 0 ? 's' : ''}** into **${potionsToAdd}**.`;
}

async function decantAllCommand(user: MUser, dose: number) {
	const res = decantAllPotionsFromBank(user.bank, dose);
	if (res.error !== null) return res.error;
	const { potionsToAdd, potionsToRemove, potionNames, sumOfPots } = res;

	if (!user.owns(potionsToRemove)) {
		return `You don't own ${potionsToRemove}.`;
	}

	await user.transactItems({
		filterLoot: false,
		itemsToRemove: potionsToRemove,
		itemsToAdd: potionsToAdd
	});

	await giveClueHunterGlovesIfEligible(user);

	return `You decanted **${sumOfPots}x potions** across **${potionNames.length} potion types** into **${potionsToAdd}**.`;
}

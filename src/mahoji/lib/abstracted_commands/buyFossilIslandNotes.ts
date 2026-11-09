import { Bank, Items } from 'oldschooljs';

import { fossilIslandNotesCL } from '@/lib/data/CollectionsExport.js';

export async function buyFossilIslandNotes(itx: OSInteraction, quantity: number) {
	const { user, rng } = itx;
	const cost = new Bank().add('Numulite', 300).multiply(quantity);
	if (await user.minionIsBusy()) {
		return 'Your minion is busy.';
	}
	if (user.QP < 3) {
		return 'You need 3 QP to reach the stone chest';
	}
	if (!user.owns(cost)) {
		return "You don't have enough Numulite.";
	}

	await itx.confirmation(
		`${user}, please confirm that you want to buy ${quantity}x Fossil Island note for: ${cost}.`
	);

	const tempClWithNewUniques = user.cl ? user.cl.clone() : new Bank();
	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		const filteredPages = fossilIslandNotesCL.filter(page => !tempClWithNewUniques.has(page));
		const outPage =
			filteredPages.length === 0
				? Items.getOrThrow(rng.pick(fossilIslandNotesCL))
				: Items.getOrThrow(rng.pick(filteredPages));
		tempClWithNewUniques.add(outPage);
		loot.add(outPage);
	}

	await user.transactItems({ itemsToRemove: cost, itemsToAdd: loot, collectionLog: true });

	return `You purchased ${loot}.`;
}

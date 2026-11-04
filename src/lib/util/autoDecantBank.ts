import type { Bank } from 'oldschooljs';

import Potions from '@/lib/minions/data/potions.js';

export function autoDecantBank(bank: Bank): Bank {
	const decantedBank = bank.clone();

	for (const potion of Potions) {
		let totalDoses = 0;

		for (const [index, itemID] of potion.items.entries()) {
			const dose = index + 1;
			totalDoses += decantedBank.amount(itemID) * dose;
		}

		if (totalDoses === 0) continue;

		for (const itemID of potion.items) {
			decantedBank.remove(itemID, decantedBank.amount(itemID));
		}

		const maxDose = potion.items.length;
		const fullPotions = Math.floor(totalDoses / maxDose);
		const leftoverDoses = totalDoses % maxDose;

		if (fullPotions > 0) {
			decantedBank.add(potion.items[maxDose - 1], fullPotions);
		}

		if (leftoverDoses > 0) {
			decantedBank.add(potion.items[leftoverDoses - 1]);
		}
	}

	return decantedBank;
}

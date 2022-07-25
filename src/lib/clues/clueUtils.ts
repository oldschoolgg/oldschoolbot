import { Bank } from 'oldschooljs';

import { ClueTiers } from './clueTiers';

export function getClueScoresFromOpenables(openableScores: Bank, mutate = false) {
	return openableScores.filter(item => Boolean(ClueTiers.find(ct => ct.id === item.id)), mutate);
}

/**
 * Removes extra clue scrolls from loot, if they got more than 1 or if they already own 1.
 */
export function deduplicateClueScrolls({ loot, currentBank }: { loot: Bank; currentBank: Bank }) {
	const newLoot = loot.clone();
	for (const { scrollID } of ClueTiers) {
		if (!newLoot.has(scrollID)) continue;
		if (currentBank.has(scrollID)) {
			newLoot.remove(scrollID, newLoot.amount(scrollID));
		} else {
			newLoot.bank[scrollID] = 1;
		}
	}
	return newLoot;
}

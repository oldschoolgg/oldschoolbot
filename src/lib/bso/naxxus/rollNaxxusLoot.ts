import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { NaxxusLootTable } from '../../minions/data/killableMonsters/custom/bosses/Naxxus';

export function rollNaxxusLoot(quantity = 1, cl?: Bank) {
	const loot = new Bank();
	loot.add(NaxxusLootTable.roll(quantity));

	// Handle uniques => Don't give duplicates until log full
	const uniqueChance = 150;
	// Add new uniques to a dummy CL to support multiple uniques per trip.
	const tempClWithNewUniques = cl ? cl.clone() : new Bank();
	for (let i = 0; i < quantity; i++) {
		if (roll(uniqueChance)) {
			const uniques = [
				{ name: 'Dark crystal', weight: 2 },
				{ name: 'Abyssal gem', weight: 3 },
				{ name: 'Tattered tome', weight: 2 },
				{ name: 'Spellbound ring', weight: 3 }
			];

			const filteredUniques = uniques.filter(u => !tempClWithNewUniques.has(u.name));
			const uniqueTable = filteredUniques.length === 0 ? uniques : filteredUniques;
			const lootTable = new LootTable();
			uniqueTable.map(u => lootTable.add(u.name, 1, u.weight));

			const unique = lootTable.roll();
			tempClWithNewUniques.add(unique);
			loot.add(unique);
		}
	}
	return loot;
}

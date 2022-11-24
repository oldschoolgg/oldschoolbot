import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { clAdjustedDroprate } from '../util';

// user is null if tame is killing
export function handleSpecialCoxLoot(user: MUser | null, loot: Bank) {
	const takonDropRate = user ? clAdjustedDroprate(user, 'Takon', 600, 2) : 4500;
	if (roll(takonDropRate)) {
		loot.add('Takon');
	}
	const steveDropRate = user ? clAdjustedDroprate(user, 'Steve', 300, 2) : 500;
	if (roll(steveDropRate)) {
		loot.add('Steve');
	}
	if (roll(140)) {
		loot.add('Clue scroll (grandmaster)');
	}
}

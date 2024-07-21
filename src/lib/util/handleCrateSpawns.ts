import { Time, roll } from 'e';
import { Bank } from 'oldschooljs';
import { keyCrates } from '../keyCrates';

export function handleCrateSpawns(duration: number) {
	const dropratePerMinute = 30;
	const minutes = Math.floor(duration / Time.Minute);
	const loot = new Bank();
	for (let i = 0; i < minutes; i++) {
		for (const crate of keyCrates) {
			if (roll(dropratePerMinute)) {
				loot.add(crate.item.id);
			}
		}
		if (roll(40)) {
			loot.add('Untradeable Mystery Box');
		}
	}

	return loot;
}

import { Time, roll } from 'e';
import { Bank } from 'oldschooljs';
import { keyCrates } from '../keyCrates';
import { RelicID } from '../relics';

export function handleCrateSpawns(user: MUser, duration: number) {
	const dropratePerMinute = 30;
	const minutes = Math.floor(duration / Time.Minute);
	const loot = new Bank();

	const umbDroprate = user.hasRelic(RelicID.Randomness) ? 20 : 40;

	for (let i = 0; i < minutes; i++) {
		for (const crate of keyCrates) {
			if (roll(dropratePerMinute)) {
				loot.add(crate.item.id);
			}
		}
		if (roll(umbDroprate)) {
			loot.add('Untradeable Mystery Box');
		}
	}

	return loot;
}

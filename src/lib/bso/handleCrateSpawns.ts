import { reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { roll } from 'node-rng';
import { Bank, Items } from 'oldschooljs';

const crateItem = Items.getOrThrow('Summer crate (s9)');

export function handleCrateSpawns(user: MUser, duration: number, kind: 'trip' | 'tame' = 'trip', _messages?: string[]) {
	const accountAge = user.accountAgeInDays();
	let dropratePerMinute = 10 * 60;
	if (kind === 'tame') dropratePerMinute *= 2;
	if (accountAge) {
		if (accountAge < 31) return null;
		if (user.isIronman) {
			dropratePerMinute = reduceNumByPercent(dropratePerMinute, 15);
		}
	}
	dropratePerMinute = Math.ceil(dropratePerMinute / 3);
	dropratePerMinute = Math.ceil(dropratePerMinute / 2);

	if (user.isIronman) {
		dropratePerMinute = Math.ceil(dropratePerMinute / 6);
	}
	const minutes = Math.floor(duration / Time.Minute);
	const loot = new Bank();
	for (let i = 0; i < minutes; i++) {
		if (roll(dropratePerMinute)) {
			loot.add(crateItem);
		}
	}

	return loot;
}

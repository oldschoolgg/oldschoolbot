import { BSOItem } from '@/lib/bso/BSOItem.js';

import { Time } from '@oldschoolgg/toolkit';
import { roll } from 'node-rng';
import { Bank, Items } from 'oldschooljs';

const crateItem = Items.getOrThrow(BSOItem.SUMMER_CRATE_S9);

export function handleCrateSpawns(user: MUser, duration: number, kind: 'trip' | 'tame' = 'trip', _messages?: string[]) {
	const accountAge = user.accountAgeInDays();
	let dropratePerMinute = 8 * 60;
	if (kind === 'tame') dropratePerMinute *= 2;
	if (accountAge) {
		if (accountAge < 31) return null;
		if (user.isIronman) {
			dropratePerMinute = Math.ceil(dropratePerMinute / 3);
		}
	}
	dropratePerMinute = Math.ceil(dropratePerMinute / 3);
	dropratePerMinute = Math.ceil(dropratePerMinute / 2);

	const rateIncreaseStart = Date.UTC(2026, 5, 7, 0, 0, 0);
	let nerf = 10;
	if (Date.now() > rateIncreaseStart) {
		const hoursSinceBoostStart = (Date.now() - rateIncreaseStart) / Time.Hour;
		nerf += hoursSinceBoostStart * 0.25;
	}
	dropratePerMinute *= nerf;
	dropratePerMinute = Math.ceil(dropratePerMinute);

	const minutes = Math.floor(duration / Time.Minute);
	const loot = new Bank();
	for (let i = 0; i < minutes; i++) {
		if (roll(dropratePerMinute)) {
			loot.add(crateItem);
		}
	}

	return loot;
}

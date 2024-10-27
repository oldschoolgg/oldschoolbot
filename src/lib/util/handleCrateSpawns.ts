import { Time, reduceNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';

import getOSItem from './getOSItem';

const crateItem = getOSItem('Birthday crate (s6)');

export function handleCrateSpawns(user: MUser, duration: number) {
	const accountAge = user.accountAgeInDays();
	let dropratePerMinute = 50 * 60;
	if (accountAge) {
		if (accountAge < 31) return null;
		if (user.isIronman) {
			dropratePerMinute = reduceNumByPercent(dropratePerMinute, 15);
		}
	}
	dropratePerMinute = Math.ceil(dropratePerMinute / 3);
	dropratePerMinute = Math.ceil(dropratePerMinute / 2);
	if (user.isIronman) {
		dropratePerMinute = Math.ceil(dropratePerMinute / 3);
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

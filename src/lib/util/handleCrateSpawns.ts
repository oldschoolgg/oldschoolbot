import { Time, reduceNumByPercent, roll } from 'e';
import { Bank, resolveItems } from 'oldschooljs';

import getOSItem from './getOSItem';
import { itemNameFromID } from './smallUtils';

const crateItem = getOSItem('Frozen crate (s8)');

const xmasPets = resolveItems(['Smokey', 'Rudolph', 'Frosty', 'Grinchling', 'Shrimpy']);

export function handleCrateSpawns(user: MUser, duration: number, messages?: string[]) {
	if (1 > Math.abs(0)) return null;
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

	if (xmasPets.some(pet => user.usingPet(pet))) {
		dropratePerMinute = Math.ceil(dropratePerMinute / 10);
		if (messages) {
			messages.push(`10x higher droprates for ${itemNameFromID(user.user.minion_equippedPet!)}`);
		}
	}

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

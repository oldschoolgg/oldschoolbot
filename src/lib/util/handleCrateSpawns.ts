import { bold } from 'discord.js';
import { Time, reduceNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';
import { keyCrates } from '../keyCrates';

export async function handleCrateSpawns(user: MUser, duration: number) {
	const accountAge = user.accountAgeInDays();
	let dropratePerMinute = 50 * 60;
	if (accountAge) {
		if (accountAge < 31) return null;
		if (user.isIronman) {
			dropratePerMinute = reduceNumByPercent(dropratePerMinute, 15);
		}
	}
	dropratePerMinute = Math.ceil(dropratePerMinute / 3);
	dropratePerMinute = Math.ceil(dropratePerMinute / 5.5);
	dropratePerMinute = Math.ceil(dropratePerMinute / 2);
	if (user.isIronman) {
		dropratePerMinute = Math.ceil(dropratePerMinute / 3);
	}
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
	if (loot.length > 0) {
		await user.addItemsToBank({ items: loot, collectionLog: true });
		const str = bold(`You found ${loot}!`);
		return str;
	}
	return null;
}

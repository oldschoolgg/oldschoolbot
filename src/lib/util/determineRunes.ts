import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import resolveItems from './resolveItems';

const res = resolveItems;

const runeItems: [number[], number[]][] = [
	[res(['Staff of water', 'Mystic water staff', 'Water battlestaff']), res(['Water rune'])],
	[res(['Staff of earth', 'Mystic earth staff', 'Earth battlestaff']), res(['Earth rune'])],
	[res(['Staff of air', 'Mystic air staff', 'Air battlestaff']), res(['Air rune'])],
	[res(['Staff of fire', 'Mystic fire staff', 'Fire battlestaff']), res(['Fire rune'])],
	[res(['Mystic lava staff', 'Lava battlestaff']), res(['Earth rune', 'Fire rune'])],
	[res(['Mystic mud staff', 'Mud battlestaff']), res(['Earth rune', 'Water rune'])],
	[res(['Mystic steam staff', 'Steam battlestaff']), res(['Fire rune', 'Water rune'])],
	[res(['Mystic smoke staff', 'Smoke battlestaff']), res(['Fire rune', 'Air rune'])],
	[res(['Mystic mist staff', 'Mist battlestaff']), res(['Water rune', 'Air rune'])],
	[res(['Mystic dust staff', 'Dust battlestaff']), res(['Earth rune', 'Air rune'])],
	[res(['Kodai wand']), res(['Water rune'])],
	[res(['Tome of water (empty)', 'Tome of water']), res(['Water rune'])],
	[res(['Tome of fire (empty)', 'Tome of fire']), res(['Fire rune'])]
];

export function determineRunes(user: KlasaUser, runeBank: Bank): Bank {
	const gear = user.rawGear();
	const staff = gear.skilling.weapon;
	const offhand = gear.skilling.shield;

	if (!staff && !offhand) return new Bank(runeBank.bank);
	for (const [itemSet, runes] of runeItems) {
		if ((staff && itemSet.includes(staff.item)) || (offhand && itemSet.includes(offhand.item))) {
			const bank = new Bank(runeBank.bank);
			for (const rune of runes) {
				bank.remove(rune, bank.amount(rune));
			}
			// Current returns after removing a single rune, doesn't support multiple items removing runes
			return bank;
		}
	}
	return new Bank(runeBank.bank);
}

import { notEmpty } from 'e';
import { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';

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

export function determineRunes(user: MUser, runeBank: Bank): Bank {
	const allWeaponsAndShields = Object.values(user.gear)
		.map(g => [g.weapon, g.shield])
		.flat(2)
		.filter(notEmpty)
		.map(i => i.item);

	const bank = new Bank(runeBank);

	for (const [itemSet, runes] of runeItems) {
		if (itemSet.some(i => allWeaponsAndShields.includes(i))) {
			for (const rune of runes) {
				if (bank.has(rune)) {
					bank.clear(rune);
				}
			}
		}
	}
	return bank;
}

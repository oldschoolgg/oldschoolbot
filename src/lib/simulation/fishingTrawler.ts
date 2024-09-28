import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { randomVariation, roll } from '../util';

export const trawlerFish = [
	{
		id: itemID('Raw shrimps'),
		level: 1,
		xp: 10
	},
	{
		id: itemID('Raw sardine'),
		level: 5,
		xp: 20
	},
	{
		id: itemID('Raw anchovies'),
		level: 15,
		xp: 40
	},
	{
		id: itemID('Raw tuna'),
		level: 35,
		xp: 80
	},
	{
		id: itemID('Raw lobster'),
		level: 40,
		xp: 90
	},
	{
		id: itemID('Raw swordfish'),
		level: 50,
		xp: 100
	},
	{
		id: itemID('Raw shark'),
		level: 76,
		xp: 110
	},
	{
		id: itemID('Raw sea turtle'),
		level: 79,
		xp: 38
	},
	{
		id: itemID('Raw manta ray'),
		level: 81,
		xp: 46
	}
];

export const RawJunkTable = new LootTable()
	.add('Broken arrow')
	.add('Broken glass')
	.add('Broken staff')
	.add('Buttons')
	.add('Damaged armour')
	.add('Old boot')
	.add('Oyster')
	.add('Pot')
	.add('Rusty sword');

const JunkTable = new LootTable().add(RawJunkTable, [0, 1]).add(RawJunkTable, [0, 1]);

const anglerOutfit = resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']);

export function fishingTrawlerLoot(fishingLevel: number, hasEliteArd: boolean, bank: Bank) {
	const loot = new Bank();
	if (roll(5000)) {
		loot.add('Heron');
	}

	if (roll(8)) {
		for (const item of anglerOutfit) {
			if (!bank.has(item)) {
				loot.add(item);
				break;
			}
		}
	}

	loot.add(JunkTable.roll());

	const ableToFish = trawlerFish.filter(i => fishingLevel >= i.level);
	let possibleFish = ableToFish.slice(Math.max(ableToFish.length - 5, 0)).reverse();

	let xp = 0;

	const len = possibleFish.length;
	let multiplier = 3;
	for (let i = 0; i < len; i++) {
		const fishToGive = possibleFish[0];

		let qty = Math.floor(randomVariation((ableToFish.indexOf(fishToGive) + 1) * multiplier, 50));
		// 50% Extra fish for having elite diary
		if (hasEliteArd) {
			qty = Math.floor(qty * 1.5);
		}

		xp += fishToGive.xp * qty;

		multiplier /= 2;
		loot.add(fishToGive.id, qty);

		// Cant get same fish twice in 1 trawler
		possibleFish = possibleFish.filter(i => i !== fishToGive);
		if (roll(3)) break;
	}

	return { loot, xp };
}

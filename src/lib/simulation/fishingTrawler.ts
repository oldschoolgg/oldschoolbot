import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { itemID } from 'oldschooljs/dist/util';

import { ItemBank } from '../types';
import { roll } from '../util';
import resolveItems from '../util/resolveItems';

const trawlerFish = [
	{
		id: itemID('Raw shrimps'),
		level: 1
	},
	{
		id: itemID('Raw sardine'),
		level: 5
	},
	{
		id: itemID('Raw anchovies'),
		level: 15
	},
	{
		id: itemID('Raw tuna'),
		level: 35
	},
	{
		id: itemID('Raw lobster'),
		level: 40
	},
	{
		id: itemID('Raw swordfish'),
		level: 50
	},
	{
		id: itemID('Raw shark'),
		level: 76
	},
	{
		id: itemID('Raw sea turtle'),
		level: 79
	},
	{
		id: itemID('Raw manta ray'),
		level: 81
	}
];

const RawJunkTable = new LootTable()
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

export function fishingTrawlerLoot(fishingLevel: number, bank: ItemBank) {
	const loot = new Bank();
	if (roll(5000)) {
		loot.add('Heron');
	}

	if (roll(8)) {
		for (const item of anglerOutfit) {
			if (!bank[item]) {
				loot.add(item);
				break;
			}
		}
	}

	loot.add(JunkTable.roll());

	let possibleFish = trawlerFish
		.filter(i => fishingLevel >= i.level)
		.slice(Math.max(trawlerFish.length - 5, 0))
		.reverse();

	// console.log(possibleFish.map(i => itemNameFromID(i.id)));

	const len = possibleFish.length;
	for (let i = 0; i < len; i++) {
		const fishToGive = possibleFish[0];
		// console.log(
		// 	`index of ${itemNameFromID(fishToGive.id)} is ${trawlerFish.indexOf(fishToGive)}`
		// );
		const qty = randInt(1, 3) * trawlerFish.indexOf(fishToGive);
		// console.log({ qty, index: possibleFish.indexOf(fishToGive) });
		loot.add(fishToGive.id, qty);

		// Cant get same fish twice in 1 trawler
		possibleFish = possibleFish.filter(i => i !== fishToGive);
		if (roll(5)) break;
	}

	return loot;
}

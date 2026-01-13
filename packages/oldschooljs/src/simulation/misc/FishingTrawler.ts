import { randomVariation, roll } from '@oldschoolgg/rng';

import { EItem } from '@/EItem.js';
import { anglerOutfit } from '@/itemGroups.js';
import { Bank } from '@/structures/Bank.js';
import LootTable from '@/structures/LootTable.js';

const trawlerFish = [
	{
		id: EItem.RAW_SHRIMPS,
		level: 1,
		xp: 10
	},
	{
		id: EItem.RAW_SARDINE,
		level: 5,
		xp: 20
	},
	{
		id: EItem.RAW_ANCHOVIES,
		level: 15,
		xp: 40
	},
	{
		id: EItem.RAW_TUNA,
		level: 35,
		xp: 80
	},
	{
		id: EItem.RAW_LOBSTER,
		level: 40,
		xp: 90
	},
	{
		id: EItem.RAW_SWORDFISH,
		level: 50,
		xp: 100
	},
	{
		id: EItem.RAW_SHARK,
		level: 76,
		xp: 110
	},
	{
		id: EItem.RAW_SEA_TURTLE,
		level: 79,
		xp: 38
	},
	{
		id: EItem.RAW_MANTA_RAY,
		level: 81,
		xp: 46
	}
];

const RawJunkTable: LootTable = new LootTable()
	.add('Broken arrow')
	.add('Broken glass')
	.add('Broken staff')
	.add('Buttons')
	.add('Damaged armour')
	.add('Old boot')
	.add('Oyster')
	.add('Pot')
	.add('Rusty sword');

const JunkTable: LootTable = new LootTable().add(RawJunkTable, [0, 1]).add(RawJunkTable, [0, 1]);

export function FishingTrawler(fishingLevel: number, hasEliteArd: boolean, bank?: Bank): { loot: Bank; xp: number } {
	const loot = new Bank();
	if (roll(5000)) {
		loot.add('Heron');
	}

	if (roll(8)) {
		for (const item of anglerOutfit) {
			if (!bank || !bank.has(item)) {
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
		possibleFish = possibleFish.filter(_f => _f !== fishToGive);
		if (roll(3)) break;
	}

	return { loot, xp };
}

import type { RNGProvider } from 'node-rng';
import { Bank } from 'oldschooljs';

import { globalConfig } from '@/lib/constants.js';
import type { MiscellaniaAreaKey } from '@/lib/miscellania/calc.js';

interface RateRow {
	item: string;
	rate: number;
	maximum?: number;
	extraItems?: { item: string; quantity: number }[];
}

const inverseCosts: Record<MiscellaniaAreaKey, number> = {
	maple: 160,
	coal: 98,
	fishing_raw: 158,
	fishing_cooked: 158,
	herbs: 11,
	flax: 224,
	mahogany: 40,
	teak: 54,
	hardwood_both: 47,
	farm_seeds: 86
};

const rateTables: Record<string, RateRow[]> = {
	nests: [
		{ item: 'Nest box (seeds)', rate: 65 / 100 },
		{ item: 'Nest box (ring)', rate: 32 / 100 },
		{
			item: 'Green bird egg',
			rate: 1 / 100,
			extraItems: [{ item: 'Bird nest', quantity: 1 }]
		},
		{
			item: 'Blue bird egg',
			rate: 1 / 100,
			extraItems: [{ item: 'Bird nest', quantity: 1 }]
		},
		{
			item: 'Red bird egg',
			rate: 1 / 100,
			extraItems: [{ item: 'Bird nest', quantity: 1 }]
		}
	],
	miningGems: [
		{ item: 'Uncut sapphire', rate: 32 / 58 },
		{ item: 'Uncut emerald', rate: 16 / 58 },
		{ item: 'Uncut ruby', rate: 8 / 58 },
		{ item: 'Uncut diamond', rate: 2 / 58 }
	],
	fishingLoot: [
		{ item: 'Uncut sapphire', rate: 32 / 104 },
		{ item: 'Uncut emerald', rate: 16 / 104 },
		{ item: 'Uncut ruby', rate: 8 / 104 },
		{ item: 'Uncut diamond', rate: 2 / 104 },
		{ item: 'Casket', rate: 32 / 104 },
		{ item: 'Fremennik boots', rate: 4 / 104 },
		{ item: 'Fremennik gloves', rate: 4 / 104 },
		{ item: 'Loop half of key', rate: 1 / 104 },
		{ item: 'Tooth half of key', rate: 1 / 104 },
		{ item: 'Clue scroll (easy)', rate: 4 / 104 }
	],
	herbs: [
		{ item: 'Grimy tarromin', rate: 10 / 46 },
		{ item: 'Grimy harralander', rate: 9 / 46 },
		{ item: 'Grimy irit leaf', rate: 6 / 46 },
		{ item: 'Grimy avantoe', rate: 6 / 46 },
		{ item: 'Grimy ranarr weed', rate: 3 / 46 },
		{ item: 'Grimy kwuarm', rate: 3 / 46 },
		{ item: 'Grimy cadantine', rate: 3 / 46 },
		{ item: 'Grimy dwarf weed', rate: 3 / 46 },
		{ item: 'Grimy lantadyme', rate: 3 / 46 }
	],
	herbSeeds: [
		{ item: 'Guam seed', rate: 320 / 1000 },
		{ item: 'Marrentill seed', rate: 218 / 1000 },
		{ item: 'Tarromin seed', rate: 149 / 1000 },
		{ item: 'Harralander seed', rate: 101 / 1000 },
		{ item: 'Ranarr seed', rate: 69 / 1000, maximum: 2 },
		{ item: 'Toadflax seed', rate: 47 / 1000 },
		{ item: 'Irit seed', rate: 32 / 1000 },
		{ item: 'Avantoe seed', rate: 22 / 1000 },
		{ item: 'Kwuarm seed', rate: 15 / 1000 },
		{ item: 'Snapdragon seed', rate: 10 / 1000 },
		{ item: 'Cadantine seed', rate: 7 / 1000 },
		{ item: 'Lantadyme seed', rate: 5 / 1000 },
		{ item: 'Dwarf weed seed', rate: 3 / 1000 },
		{ item: 'Torstol seed', rate: 2 / 1000 }
	],
	flaxSeeds: [
		{ item: 'Guam seed', rate: 320 / 1000 },
		{ item: 'Marrentill seed', rate: 218 / 1000 },
		{ item: 'Tarromin seed', rate: 149 / 1000 },
		{ item: 'Harralander seed', rate: 101 / 1000 },
		{ item: 'Ranarr seed', rate: 69 / 1000 },
		{ item: 'Toadflax seed', rate: 47 / 1000 },
		{ item: 'Irit seed', rate: 32 / 1000 },
		{ item: 'Avantoe seed', rate: 22 / 1000 },
		{ item: 'Kwuarm seed', rate: 15 / 1000 },
		{ item: 'Snapdragon seed', rate: 10 / 1000 },
		{ item: 'Cadantine seed', rate: 7 / 1000 },
		{ item: 'Lantadyme seed', rate: 5 / 1000 },
		{ item: 'Dwarf weed seed', rate: 3 / 1000 },
		{ item: 'Torstol seed', rate: 2 / 1000 }
	],
	treeSeeds: [
		{ item: 'Acorn', rate: 214 / 1011, maximum: 4 },
		{ item: 'Apple tree seed', rate: 170 / 1011, maximum: 4 },
		{ item: 'Willow seed', rate: 135 / 1011, maximum: 4 },
		{ item: 'Banana tree seed', rate: 108 / 1011, maximum: 4 },
		{ item: 'Orange tree seed', rate: 85 / 1011, maximum: 4 },
		{ item: 'Curry tree seed', rate: 68 / 1011, maximum: 4 },
		{ item: 'Maple seed', rate: 54 / 1011, maximum: 4 },
		{ item: 'Pineapple seed', rate: 42 / 1011, maximum: 4 },
		{ item: 'Papaya tree seed', rate: 34 / 1011, maximum: 4 },
		{ item: 'Yew seed', rate: 27 / 1011, maximum: 4 },
		{ item: 'Palm tree seed', rate: 22 / 1011, maximum: 4 },
		{ item: 'Calquat tree seed', rate: 17 / 1011, maximum: 4 },
		{ item: 'Spirit seed', rate: 11 / 1011, maximum: 4 },
		{ item: 'Dragonfruit tree seed', rate: 6 / 1011, maximum: 4 },
		{ item: 'Magic seed', rate: 5 / 1011, maximum: 4 },
		{ item: 'Teak seed', rate: 4 / 1011, maximum: 4 },
		{ item: 'Mahogany seed', rate: 4 / 1011, maximum: 4 },
		{ item: 'Celastrus seed', rate: 3 / 1011, maximum: 4 },
		{ item: 'Redwood tree seed', rate: 2 / 1011, maximum: 4 }
	],
	seeds: [
		{ item: 'Potato seed', rate: 1_567_735 / 8_858_315 },
		{ item: 'Onion seed', rate: 1_180_708 / 8_858_315 },
		{ item: 'Cabbage seed', rate: 619_972 / 8_858_315 },
		{ item: 'Tomato seed', rate: 561_932 / 8_858_315 },
		{ item: 'Barley seed', rate: 497_148 / 8_858_315 },
		{ item: 'Hammerstone seed', rate: 494_318 / 8_858_315 },
		{ item: 'Marigold seed', rate: 409_668 / 8_858_315 },
		{ item: 'Asgarnian seed', rate: 369_067 / 8_858_315 },
		{ item: 'Jute seed', rate: 368_455 / 8_858_315 },
		{ item: 'Redberry seed', rate: 343_409 / 8_858_315 },
		{ item: 'Nasturtium seed', rate: 270_351 / 8_858_315 },
		{ item: 'Yanillian seed', rate: 245_383 / 8_858_315 },
		{ item: 'Cadavaberry seed', rate: 242_164 / 8_858_315 },
		{ item: 'Sweetcorn seed', rate: 197_249 / 8_858_315 },
		{ item: 'Rosemary seed', rate: 173_977 / 8_858_315 },
		{ item: 'Dwellberry seed', rate: 172_110 / 8_858_315 },
		{ item: 'Guam seed', rate: 135_320 / 8_858_315 },
		{ item: 'Woad seed', rate: 129_804 / 8_858_315 },
		{ item: 'Krandorian seed', rate: 122_649 / 8_858_315 },
		{ item: 'Limpwurt seed', rate: 103_567 / 8_858_315 },
		{ item: 'Strawberry seed', rate: 97_042 / 8_858_315 },
		{ item: 'Marrentill seed', rate: 93_062 / 8_858_315 },
		{ item: 'Jangerberry seed', rate: 69_567 / 8_858_315 },
		{ item: 'Wildblood seed', rate: 62_976 / 8_858_315 },
		{ item: 'Tarromin seed', rate: 62_551 / 8_858_315 },
		{ item: 'Watermelon seed', rate: 47_071 / 8_858_315 },
		{ item: 'Harralander seed', rate: 43_198 / 8_858_315 },
		{ item: 'Snape grass seed', rate: 34_094 / 8_858_315 },
		{ item: 'Whiteberry seed', rate: 24_586 / 8_858_315 },
		{ item: 'Toadflax seed', rate: 19_990 / 8_858_315 },
		{ item: 'Mushroom spore', rate: 19_266 / 8_858_315 },
		{ item: 'Irit seed', rate: 14_019 / 8_858_315 },
		{ item: 'Belladonna seed', rate: 11_594 / 8_858_315 },
		{ item: 'Avantoe seed', rate: 9_229 / 8_858_315 },
		{ item: 'Poison ivy seed', rate: 9_199 / 8_858_315 },
		{ item: 'Cactus seed', rate: 7_850 / 8_858_315 },
		{ item: 'Kwuarm seed', rate: 6_599 / 8_858_315 },
		{ item: 'Ranarr seed', rate: 5_305 / 8_858_315, maximum: 2 },
		{ item: 'Snapdragon seed', rate: 3_901 / 8_858_315 },
		{ item: 'Potato cactus seed', rate: 3_790 / 8_858_315 },
		{ item: 'Cadantine seed', rate: 2_817 / 8_858_315 },
		{ item: 'Lantadyme seed', rate: 2_097 / 8_858_315 },
		{ item: 'Seaweed spore', rate: 1_508 / 8_858_315 },
		{ item: 'Dwarf weed seed', rate: 1_208 / 8_858_315 },
		{ item: 'Torstol seed', rate: 810 / 8_858_315 }
	]
};

const loggedUnknownItems = new Set<string>();

function addItemSafe(bank: Bank, itemName: string, quantity: number) {
	if (quantity <= 0) return;
	try {
		bank.add(itemName as any, quantity);
	} catch (error) {
		const message = `Unknown Miscellania loot item: "${itemName}"`;
		if (!globalConfig.isProduction) {
			const err = new Error(message);
			(err as Error & { cause?: unknown }).cause = error;
			throw err;
		}
		if (!loggedUnknownItems.has(itemName)) {
			loggedUnknownItems.add(itemName);
			Logging.logError({
				err: error as Error,
				message,
				context: { itemName, quantity }
			});
		}
	}
}

function rollRateRow(rateTable: RateRow[], rng: RNGProvider): RateRow | null {
	if (rateTable.length === 0) return null;
	const totalWeight = rateTable.reduce((acc, row) => acc + row.rate, 0);
	if (totalWeight <= 0) return null;
	let roll = rng.randFloat(0, totalWeight);
	for (const row of rateTable) {
		roll -= row.rate;
		if (roll <= 0) return row;
	}
	return rateTable[rateTable.length - 1];
}

function addFromRateTable(bank: Bank, rateTable: RateRow[], amount: number, rng: RNGProvider) {
	const trials = Math.max(0, Math.floor(amount));
	if (trials <= 0) return;
	const rolledCounts: Record<string, number> = {};
	const extraCounts: Record<string, number> = {};
	for (let i = 0; i < trials; i++) {
		const row = rollRateRow(rateTable, rng);
		if (!row) continue;
		const currentCount = rolledCounts[row.item] ?? 0;
		if (row.maximum !== undefined && currentCount >= row.maximum) continue;
		rolledCounts[row.item] = currentCount + 1;
		if (row.extraItems) {
			for (const extra of row.extraItems) {
				extraCounts[extra.item] = (extraCounts[extra.item] ?? 0) + extra.quantity;
			}
		}
	}
	for (const [item, qty] of Object.entries(rolledCounts)) {
		addItemSafe(bank, item, qty);
	}
	for (const [item, qty] of Object.entries(extraCounts)) {
		addItemSafe(bank, item, qty);
	}
}

function generateAreaLoot(area: MiscellaniaAreaKey, workers: number, resourcePoints: number, rng: RNGProvider): Bank {
	const loot = new Bank();
	const inverseCost = inverseCosts[area];
	const baseQty = Math.floor((workers * inverseCost * resourcePoints) / 2048);
	if (baseQty <= 0) return loot;

	switch (area) {
		case 'maple':
			addItemSafe(loot, 'Maple logs', baseQty);
			addFromRateTable(loot, rateTables.nests, Math.min(999, Math.floor(baseQty / 100)), rng);
			break;
		case 'coal':
			addItemSafe(loot, 'Coal', baseQty);
			addFromRateTable(loot, rateTables.miningGems, Math.floor(baseQty / 200 + 0.5), rng);
			break;
		case 'fishing_raw':
			addItemSafe(loot, 'Raw tuna', Math.floor(0.5 * baseQty));
			addItemSafe(loot, 'Raw swordfish', Math.floor(0.15 * baseQty));
			addFromRateTable(loot, rateTables.fishingLoot, Math.floor(baseQty / 200), rng);
			break;
		case 'fishing_cooked':
			addItemSafe(loot, 'Tuna', Math.floor(0.5 * baseQty));
			addItemSafe(loot, 'Swordfish', Math.floor(0.15 * baseQty));
			addFromRateTable(loot, rateTables.fishingLoot, Math.floor(baseQty / 200), rng);
			break;
		case 'herbs':
			addFromRateTable(loot, rateTables.herbs, baseQty, rng);
			addFromRateTable(loot, rateTables.herbSeeds, Math.floor(baseQty / 100), rng);
			break;
		case 'flax':
			addItemSafe(loot, 'Flax', baseQty);
			addFromRateTable(loot, rateTables.flaxSeeds, Math.floor(baseQty / 600), rng);
			break;
		case 'mahogany':
			addItemSafe(loot, 'Mahogany logs', baseQty);
			addFromRateTable(loot, rateTables.nests, Math.floor(baseQty / 350), rng);
			break;
		case 'teak':
			addItemSafe(loot, 'Teak logs', baseQty);
			addFromRateTable(loot, rateTables.nests, Math.floor(baseQty / 350), rng);
			break;
		case 'hardwood_both':
			addItemSafe(loot, 'Mahogany logs', Math.floor(0.5 * baseQty));
			addItemSafe(loot, 'Teak logs', Math.floor(0.5 * baseQty));
			addFromRateTable(loot, rateTables.nests, Math.floor(baseQty / 350), rng);
			break;
		case 'farm_seeds':
			addFromRateTable(loot, rateTables.seeds, baseQty, rng);
			addFromRateTable(loot, rateTables.treeSeeds, Math.floor(baseQty / 200), rng);
			break;
	}

	return loot;
}

export function generateMiscellaniaLoot({
	resourcePoints,
	primaryArea,
	secondaryArea,
	rng
}: {
	resourcePoints: number;
	primaryArea: MiscellaniaAreaKey;
	secondaryArea: MiscellaniaAreaKey;
	rng: RNGProvider;
}): Bank {
	const safePoints = Math.max(0, Math.floor(resourcePoints));
	if (safePoints <= 0) return new Bank();
	return new Bank()
		.add(generateAreaLoot(primaryArea, 10, safePoints, rng))
		.add(generateAreaLoot(secondaryArea, 5, safePoints, rng));
}

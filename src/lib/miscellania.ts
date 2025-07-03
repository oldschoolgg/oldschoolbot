import { Bank } from 'oldschooljs';
import { randFloat } from './util';

export interface MiscellaniaLootItem {
	item: string;
	weight: number;
	maximum?: number;
}

export interface MiscWorkerAllocation {
	woodcutting: number;
	mining: number;
	fishingRaw: number;
	fishingCooked: number;
	herbs: number;
	flax: number;
	hardwoodMahogany: number;
	hardwoodTeak: number;
	hardwoodBoth: number;
	farmSeeds: number;
}

export const inverseCosts: Record<keyof MiscWorkerAllocation, number> = {
	woodcutting: 160,
	mining: 98,
	fishingRaw: 158,
	fishingCooked: 158,
	herbs: 11,
	flax: 224,
	hardwoodMahogany: 40,
	hardwoodTeak: 54,
	hardwoodBoth: 47,
	farmSeeds: 86
};

export const rateTables: Record<string, MiscellaniaLootItem[]> = {
	Nests: [
		{ item: 'Bird nest (seed)', weight: 65 },
		{ item: 'Bird nest (ring)', weight: 32 },
		{ item: 'Bird nest (green egg)', weight: 1 },
		{ item: 'Bird nest (blue egg)', weight: 1 },
		{ item: 'Bird nest (red egg)', weight: 1 }
	],
	'Mining gems': [
		{ item: 'Uncut sapphire', weight: 32 },
		{ item: 'Uncut emerald', weight: 16 },
		{ item: 'Uncut ruby', weight: 8 },
		{ item: 'Uncut diamond', weight: 2 }
	],
	'Fishing loot': [
		{ item: 'Uncut sapphire', weight: 32 },
		{ item: 'Uncut emerald', weight: 16 },
		{ item: 'Uncut ruby', weight: 8 },
		{ item: 'Uncut diamond', weight: 2 },
		{ item: 'Casket', weight: 32 },
		{ item: 'Fremennik boots', weight: 4 },
		{ item: 'Fremennik gloves', weight: 4 },
		{ item: 'Loop half of key', weight: 1 },
		{ item: 'Tooth half of key', weight: 1 },
		{ item: 'Clue scroll (easy)', weight: 4 }
	],
	Herbs: [
		{ item: 'Grimy tarromin', weight: 10 },
		{ item: 'Grimy harralander', weight: 9 },
		{ item: 'Grimy irit leaf', weight: 6 },
		{ item: 'Grimy avantoe', weight: 6 },
		{ item: 'Grimy ranarr weed', weight: 3 },
		{ item: 'Grimy kwuarm', weight: 3 },
		{ item: 'Grimy cadantine', weight: 3 },
		{ item: 'Grimy dwarf weed', weight: 3 },
		{ item: 'Grimy lantadyme', weight: 3 }
	],
	'Herb seeds': [
		{ item: 'Guam seed', weight: 320 },
		{ item: 'Marrentill seed', weight: 218 },
		{ item: 'Tarromin seed', weight: 149 },
		{ item: 'Harralander seed', weight: 101 },
		{ item: 'Ranarr seed', weight: 69, maximum: 2 },
		{ item: 'Toadflax seed', weight: 47 },
		{ item: 'Irit seed', weight: 32 },
		{ item: 'Avantoe seed', weight: 22 },
		{ item: 'Kwuarm seed', weight: 15 },
		{ item: 'Snapdragon seed', weight: 10 },
		{ item: 'Cadantine seed', weight: 7 },
		{ item: 'Lantadyme seed', weight: 5 },
		{ item: 'Dwarf weed seed', weight: 3 },
		{ item: 'Torstol seed', weight: 2 }
	],
	'Flax seeds': [
		{ item: 'Guam seed', weight: 320 },
		{ item: 'Marrentill seed', weight: 218 },
		{ item: 'Tarromin seed', weight: 149 },
		{ item: 'Harralander seed', weight: 101 },
		{ item: 'Ranarr seed', weight: 69 },
		{ item: 'Toadflax seed', weight: 47 },
		{ item: 'Irit seed', weight: 32 },
		{ item: 'Avantoe seed', weight: 22 },
		{ item: 'Kwuarm seed', weight: 15 },
		{ item: 'Snapdragon seed', weight: 10 },
		{ item: 'Cadantine seed', weight: 7 },
		{ item: 'Lantadyme seed', weight: 5 },
		{ item: 'Dwarf weed seed', weight: 3 },
		{ item: 'Torstol seed', weight: 2 }
	],
	'Tree seeds': [
		{ item: 'Acorn', weight: 214, maximum: 4 },
		{ item: 'Apple tree seed', weight: 170, maximum: 4 },
		{ item: 'Willow seed', weight: 135, maximum: 4 },
		{ item: 'Banana tree seed', weight: 108, maximum: 4 },
		{ item: 'Orange tree seed', weight: 85, maximum: 4 },
		{ item: 'Curry tree seed', weight: 68, maximum: 4 },
		{ item: 'Maple seed', weight: 54, maximum: 4 },
		{ item: 'Pineapple seed', weight: 42, maximum: 4 },
		{ item: 'Papaya tree seed', weight: 34, maximum: 4 },
		{ item: 'Yew seed', weight: 27, maximum: 4 },
		{ item: 'Palm tree seed', weight: 22, maximum: 4 },
		{ item: 'Calquat tree seed', weight: 17, maximum: 4 },
		{ item: 'Spirit seed', weight: 11, maximum: 4 },
		{ item: 'Dragonfruit tree seed', weight: 6, maximum: 4 },
		{ item: 'Magic seed', weight: 5, maximum: 4 },
		{ item: 'Teak seed', weight: 4, maximum: 4 },
		{ item: 'Mahogany seed', weight: 4, maximum: 4 },
		{ item: 'Celastrus seed', weight: 3, maximum: 4 },
		{ item: 'Redwood tree seed', weight: 2, maximum: 4 }
	],
	Seeds: [
		{ item: 'Potato seed', weight: 1567735 },
		{ item: 'Onion seed', weight: 1180708 },
		{ item: 'Cabbage seed', weight: 619972 },
		{ item: 'Tomato seed', weight: 561932 },
		{ item: 'Barley seed', weight: 497148 },
		{ item: 'Hammerstone seed', weight: 494318 },
		{ item: 'Marigold seed', weight: 409668 },
		{ item: 'Asgarnian seed', weight: 369067 },
		{ item: 'Jute seed', weight: 368455 },
		{ item: 'Redberry seed', weight: 343409 },
		{ item: 'Nasturtium seed', weight: 270351 },
		{ item: 'Yanillian seed', weight: 245383 },
		{ item: 'Cadavaberry seed', weight: 242164 },
		{ item: 'Sweetcorn seed', weight: 197249 },
		{ item: 'Rosemary seed', weight: 173977 },
		{ item: 'Dwellberry seed', weight: 172110 },
		{ item: 'Guam seed', weight: 135320 },
		{ item: 'Woad seed', weight: 129804 },
		{ item: 'Krandorian seed', weight: 122649 },
		{ item: 'Limpwurt seed', weight: 103567 },
		{ item: 'Strawberry seed', weight: 97042 },
		{ item: 'Marrentill seed', weight: 93062 },
		{ item: 'Jangerberry seed', weight: 69567 },
		{ item: 'Wildblood seed', weight: 62976 },
		{ item: 'Tarromin seed', weight: 62551 },
		{ item: 'Watermelon seed', weight: 47071 },
		{ item: 'Harralander seed', weight: 43198 },
		{ item: 'Snape grass seed', weight: 34094 },
		{ item: 'Whiteberry seed', weight: 24586 },
		{ item: 'Toadflax seed', weight: 19990 },
		{ item: 'Mushroom spore', weight: 19266 },
		{ item: 'Irit seed', weight: 14019 },
		{ item: 'Belladonna seed', weight: 11594 },
		{ item: 'Avantoe seed', weight: 9229 },
		{ item: 'Poison ivy seed', weight: 9199 },
		{ item: 'Cactus seed', weight: 7850 },
		{ item: 'Kwuarm seed', weight: 6599 },
		{ item: 'Ranarr seed', weight: 5305, maximum: 2 },
		{ item: 'Snapdragon seed', weight: 3901 },
		{ item: 'Potato cactus seed', weight: 3790 },
		{ item: 'Cadantine seed', weight: 2817 },
		{ item: 'Lantadyme seed', weight: 2097 },
		{ item: 'Seaweed spore', weight: 1508 },
		{ item: 'Dwarf weed seed', weight: 1208 },
		{ item: 'Torstol seed', weight: 810 }
	]
};

function weightedPick(table: MiscellaniaLootItem[], total: number): MiscellaniaLootItem {
	let roll = randFloat(0, total);
	for (const row of table) {
		if (roll < row.weight) return row;
		roll -= row.weight;
	}
	return table[table.length - 1];
}

export function rollFromRateTable(table: MiscellaniaLootItem[], amount: number, bank: Bank) {
	if (amount <= 0) return;
	const counts: Record<string, number> = {};
	const total = table.reduce((t, r) => t + r.weight, 0);
	for (let i = 0; i < amount; i++) {
		let row: MiscellaniaLootItem;
		let attempts = 0;
		do {
			row = weightedPick(table, total);
			attempts++;
		} while (row.maximum !== undefined && (counts[row.item] ?? 0) >= row.maximum && attempts < 10);
		if (row.maximum !== undefined && (counts[row.item] ?? 0) >= row.maximum) continue;
		counts[row.item] = (counts[row.item] ?? 0) + 1;
		bank.add(row.item);
	}
}

export function gatherCategory(
	bank: Bank,
	category: keyof MiscWorkerAllocation,
	workers: number,
	resourcePoints: number
) {
	if (workers <= 0) return;
	const inverseCost = inverseCosts[category];
	const baseQty = Math.floor((workers * inverseCost * resourcePoints) / 2048);
	switch (category) {
		case 'woodcutting':
			bank.add('Maple logs', baseQty);
			rollFromRateTable(rateTables.Nests, Math.min(999, Math.floor(baseQty / 100)), bank);
			break;
		case 'mining':
			bank.add('Coal', baseQty);
			rollFromRateTable(rateTables['Mining gems'], Math.floor(baseQty / 200 + 0.5), bank);
			break;
		case 'fishingRaw':
			bank.add('Raw tuna', Math.floor(0.5 * baseQty));
			bank.add('Raw swordfish', Math.floor(0.15 * baseQty));
			rollFromRateTable(rateTables['Fishing loot'], Math.floor(baseQty / 200), bank);
			break;
		case 'fishingCooked':
			bank.add('Tuna', Math.floor(0.5 * baseQty));
			bank.add('Swordfish', Math.floor(0.15 * baseQty));
			rollFromRateTable(rateTables['Fishing loot'], Math.floor(baseQty / 200), bank);
			break;
		case 'herbs':
			rollFromRateTable(rateTables.Herbs, baseQty, bank);
			rollFromRateTable(rateTables['Herb seeds'], Math.floor(baseQty / 100), bank);
			break;
		case 'flax':
			bank.add('Flax', baseQty);
			rollFromRateTable(rateTables['Flax seeds'], Math.floor(baseQty / 600), bank);
			break;
		case 'hardwoodMahogany':
			bank.add('Mahogany logs', baseQty);
			rollFromRateTable(rateTables.Nests, Math.floor(baseQty / 350), bank);
			break;
		case 'hardwoodTeak':
			bank.add('Teak logs', baseQty);
			rollFromRateTable(rateTables.Nests, Math.floor(baseQty / 350), bank);
			break;
		case 'hardwoodBoth':
			bank.add('Mahogany logs', Math.floor(0.5 * baseQty));
			bank.add('Teak logs', Math.floor(0.5 * baseQty));
			rollFromRateTable(rateTables.Nests, Math.floor(baseQty / 350), bank);
			break;
		case 'farmSeeds':
			rollFromRateTable(rateTables.Seeds, baseQty, bank);
			rollFromRateTable(rateTables['Tree seeds'], Math.floor(baseQty / 200), bank);
			break;
	}
}

export interface MiscellaniaData {
	approval: number;
	coffer: number;
	lastCollect: number;
	maintainApproval: boolean;
	workers: number;
	allocation: MiscWorkerAllocation;
}

const MAX_WITHDRAW_ROYAL = 75000;
const MAX_WITHDRAW_BASE = 50000;
const APPROVAL_DECAY_BASE = 160;
const APPROVAL_DECAY_ROYAL = 131;

export function simulateDay(state: MiscellaniaData, royalTrouble: boolean): number {
	const maxWithdraw = royalTrouble ? MAX_WITHDRAW_ROYAL : MAX_WITHDRAW_BASE;
	const withdraw = Math.max(0, Math.min(5 + Math.floor(state.coffer / 10), maxWithdraw, state.coffer));
	state.coffer -= withdraw;
	const workerEffectiveness = Math.floor((withdraw * 100) / 8333);
	const resourcePoints = Math.floor((workerEffectiveness * state.approval) / 100);
	if (!state.maintainApproval && state.approval > 32) {
		const favourSubtraction = royalTrouble ? APPROVAL_DECAY_ROYAL : APPROVAL_DECAY_BASE;
		state.approval = Math.max(32, state.approval - Math.ceil((favourSubtraction - state.approval) / 15));
	}
	return resourcePoints;
}

export function simulateCollection(days: number, overrides: Partial<MiscellaniaData> = {}): Bank {
	const base = defaultMiscellaniaData();
	const state: MiscellaniaData = {
		...base,
		...overrides,
		allocation: { ...base.allocation, ...(overrides.allocation ?? {}) }
	};
	const bank = new Bank();
	for (let i = 0; i < days; i++) {
		const rp = simulateDay(state, true);
		for (const [cat, workers] of Object.entries(state.allocation) as [keyof MiscWorkerAllocation, number][]) {
			gatherCategory(bank, cat, workers, rp);
		}
	}
	return bank;
}

export function defaultMiscellaniaData(): MiscellaniaData {
	return {
		approval: 100,
		coffer: 0,
		lastCollect: Date.now(),
		maintainApproval: false,
		workers: 10,
		allocation: {
			woodcutting: 5,
			mining: 5,
			fishingRaw: 0,
			fishingCooked: 0,
			herbs: 0,
			flax: 0,
			hardwoodMahogany: 0,
			hardwoodTeak: 0,
			hardwoodBoth: 0,
			farmSeeds: 0
		}
	};
}

import { Bank } from 'oldschooljs';
import { randFloat } from './util';

export interface RateTableRow {
	item: string;
	rate: number;
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

export const rateTables = {
	Nests: [
		{ item: 'Bird nest (seed)', rate: 65 },
		{ item: 'Bird nest (ring)', rate: 32 },
		{ item: 'Bird nest (green egg)', rate: 1 },
		{ item: 'Bird nest (blue egg)', rate: 1 },
		{ item: 'Bird nest (red egg)', rate: 1 }
	] as RateTableRow[],
	'Mining gems': [
		{ item: 'Uncut sapphire', rate: 32 },
		{ item: 'Uncut emerald', rate: 16 },
		{ item: 'Uncut ruby', rate: 8 },
		{ item: 'Uncut diamond', rate: 2 }
	] as RateTableRow[],
	'Fishing loot': [
		{ item: 'Uncut sapphire', rate: 32 },
		{ item: 'Uncut emerald', rate: 16 },
		{ item: 'Uncut ruby', rate: 8 },
		{ item: 'Uncut diamond', rate: 2 },
		{ item: 'Casket', rate: 32 },
		{ item: 'Fremennik boots', rate: 4 },
		{ item: 'Fremennik gloves', rate: 4 },
		{ item: 'Loop half of key', rate: 1 },
		{ item: 'Tooth half of key', rate: 1 },
		{ item: 'Clue scroll (easy)', rate: 4 }
	] as RateTableRow[],
	Herbs: [
		{ item: 'Grimy tarromin', rate: 10 },
		{ item: 'Grimy harralander', rate: 9 },
		{ item: 'Grimy irit leaf', rate: 6 },
		{ item: 'Grimy avantoe', rate: 6 },
		{ item: 'Grimy ranarr weed', rate: 3 },
		{ item: 'Grimy kwuarm', rate: 3 },
		{ item: 'Grimy cadantine', rate: 3 },
		{ item: 'Grimy dwarf weed', rate: 3 },
		{ item: 'Grimy lantadyme', rate: 3 }
	] as RateTableRow[],
	'Herb seeds': [
		{ item: 'Guam seed', rate: 320 },
		{ item: 'Marrentill seed', rate: 218 },
		{ item: 'Tarromin seed', rate: 149 },
		{ item: 'Harralander seed', rate: 101 },
		{ item: 'Ranarr seed', rate: 69, maximum: 2 },
		{ item: 'Toadflax seed', rate: 47 },
		{ item: 'Irit seed', rate: 32 },
		{ item: 'Avantoe seed', rate: 22 },
		{ item: 'Kwuarm seed', rate: 15 },
		{ item: 'Snapdragon seed', rate: 10 },
		{ item: 'Cadantine seed', rate: 7 },
		{ item: 'Lantadyme seed', rate: 5 },
		{ item: 'Dwarf weed seed', rate: 3 },
		{ item: 'Torstol seed', rate: 2 }
	] as RateTableRow[],
	'Flax seeds': [
		{ item: 'Guam seed', rate: 320 },
		{ item: 'Marrentill seed', rate: 218 },
		{ item: 'Tarromin seed', rate: 149 },
		{ item: 'Harralander seed', rate: 101 },
		{ item: 'Ranarr seed', rate: 69 },
		{ item: 'Toadflax seed', rate: 47 },
		{ item: 'Irit seed', rate: 32 },
		{ item: 'Avantoe seed', rate: 22 },
		{ item: 'Kwuarm seed', rate: 15 },
		{ item: 'Snapdragon seed', rate: 10 },
		{ item: 'Cadantine seed', rate: 7 },
		{ item: 'Lantadyme seed', rate: 5 },
		{ item: 'Dwarf weed seed', rate: 3 },
		{ item: 'Torstol seed', rate: 2 }
	] as RateTableRow[],
	'Tree seeds': [
		{ item: 'Acorn', rate: 214, maximum: 4 },
		{ item: 'Apple tree seed', rate: 170, maximum: 4 },
		{ item: 'Willow seed', rate: 135, maximum: 4 },
		{ item: 'Banana tree seed', rate: 108, maximum: 4 },
		{ item: 'Orange tree seed', rate: 85, maximum: 4 },
		{ item: 'Curry tree seed', rate: 68, maximum: 4 },
		{ item: 'Maple seed', rate: 54, maximum: 4 },
		{ item: 'Pineapple seed', rate: 42, maximum: 4 },
		{ item: 'Papaya tree seed', rate: 34, maximum: 4 },
		{ item: 'Yew seed', rate: 27, maximum: 4 },
		{ item: 'Palm tree seed', rate: 22, maximum: 4 },
		{ item: 'Calquat tree seed', rate: 17, maximum: 4 },
		{ item: 'Spirit seed', rate: 11, maximum: 4 },
		{ item: 'Dragonfruit tree seed', rate: 6, maximum: 4 },
		{ item: 'Magic seed', rate: 5, maximum: 4 },
		{ item: 'Teak seed', rate: 4, maximum: 4 },
		{ item: 'Mahogany seed', rate: 4, maximum: 4 },
		{ item: 'Celastrus seed', rate: 3, maximum: 4 },
		{ item: 'Redwood tree seed', rate: 2, maximum: 4 }
	] as RateTableRow[],
	Seeds: [
		{ item: 'Potato seed', rate: 1567735 },
		{ item: 'Onion seed', rate: 1180708 },
		{ item: 'Cabbage seed', rate: 619972 },
		{ item: 'Tomato seed', rate: 561932 },
		{ item: 'Barley seed', rate: 497148 },
		{ item: 'Hammerstone seed', rate: 494318 },
		{ item: 'Marigold seed', rate: 409668 },
		{ item: 'Asgarnian seed', rate: 369067 },
		{ item: 'Jute seed', rate: 368455 },
		{ item: 'Redberry seed', rate: 343409 },
		{ item: 'Nasturtium seed', rate: 270351 },
		{ item: 'Yanillian seed', rate: 245383 },
		{ item: 'Cadavaberry seed', rate: 242164 },
		{ item: 'Sweetcorn seed', rate: 197249 },
		{ item: 'Rosemary seed', rate: 173977 },
		{ item: 'Dwellberry seed', rate: 172110 },
		{ item: 'Guam seed', rate: 135320 },
		{ item: 'Woad seed', rate: 129804 },
		{ item: 'Krandorian seed', rate: 122649 },
		{ item: 'Limpwurt seed', rate: 103567 },
		{ item: 'Strawberry seed', rate: 97042 },
		{ item: 'Marrentill seed', rate: 93062 },
		{ item: 'Jangerberry seed', rate: 69567 },
		{ item: 'Wildblood seed', rate: 62976 },
		{ item: 'Tarromin seed', rate: 62551 },
		{ item: 'Watermelon seed', rate: 47071 },
		{ item: 'Harralander seed', rate: 43198 },
		{ item: 'Snape grass seed', rate: 34094 },
		{ item: 'Whiteberry seed', rate: 24586 },
		{ item: 'Toadflax seed', rate: 19990 },
		{ item: 'Mushroom spore', rate: 19266 },
		{ item: 'Irit seed', rate: 14019 },
		{ item: 'Belladonna seed', rate: 11594 },
		{ item: 'Avantoe seed', rate: 9229 },
		{ item: 'Poison ivy seed', rate: 9199 },
		{ item: 'Cactus seed', rate: 7850 },
		{ item: 'Kwuarm seed', rate: 6599 },
		{ item: 'Ranarr seed', rate: 5305, maximum: 2 },
		{ item: 'Snapdragon seed', rate: 3901 },
		{ item: 'Potato cactus seed', rate: 3790 },
		{ item: 'Cadantine seed', rate: 2817 },
		{ item: 'Lantadyme seed', rate: 2097 },
		{ item: 'Seaweed spore', rate: 1508 },
		{ item: 'Dwarf weed seed', rate: 1208 },
		{ item: 'Torstol seed', rate: 810 }
	] as RateTableRow[]
};

function weightedPick(table: RateTableRow[], total: number): RateTableRow {
	let roll = randFloat(0, total);
	for (const row of table) {
		if (roll < row.rate) return row;
		roll -= row.rate;
	}
	return table[table.length - 1];
}

export function rollFromRateTable(table: RateTableRow[], amount: number, bank: Bank) {
	if (amount <= 0) return;
	const counts: Record<string, number> = {};
	const total = table.reduce((t, r) => t + r.rate, 0);
	for (let i = 0; i < amount; i++) {
		let row: RateTableRow;
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

export function simulateCollection(days: number): Bank {
	const state = defaultMiscellaniaData();
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

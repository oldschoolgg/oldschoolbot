import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

export type MixologyPaste = 'Mox' | 'Lye' | 'Aga';
export type MixologyPoints = Record<MixologyPaste, number>;

export const mixologyPastePerPotionStep = 10;
export const mixologyContractBatchSize = 3;
export const mixologyTwoOrderBonus = 1.2;
export const mixologyThreeOrderBonus = 1.4;
export const mixologyHerbUseDuration = Time.Second * 0.72;
export const mixologyContractsPerHour = 343;
export const mixologyContractDuration = Time.Hour / mixologyContractsPerHour;

export interface MixologyHerb {
	name: string;
	paste: MixologyPaste;
	quantity: number;
}

const baseHerbs: { base: string; paste: MixologyPaste; quantity: number; unf?: string }[] = [
	{ base: 'Guam leaf', paste: 'Mox', quantity: 10, unf: 'Guam potion (unf)' },
	{ base: 'Marrentill', paste: 'Mox', quantity: 13 },
	{ base: 'Tarromin', paste: 'Mox', quantity: 15 },
	{ base: 'Harralander', paste: 'Mox', quantity: 20 },
	{ base: 'Ranarr weed', paste: 'Lye', quantity: 26, unf: 'Ranarr potion (unf)' },
	{ base: 'Toadflax', paste: 'Lye', quantity: 32 },
	{ base: 'Irit leaf', paste: 'Aga', quantity: 30, unf: 'Irit potion (unf)' },
	{ base: 'Avantoe', paste: 'Lye', quantity: 30 },
	{ base: 'Kwuarm', paste: 'Lye', quantity: 33 },
	{ base: 'Huasca', paste: 'Aga', quantity: 20 },
	{ base: 'Snapdragon', paste: 'Lye', quantity: 40 },
	{ base: 'Cadantine', paste: 'Aga', quantity: 34 },
	{ base: 'Lantadyme', paste: 'Aga', quantity: 40 },
	{ base: 'Dwarf weed', paste: 'Aga', quantity: 42 },
	{ base: 'Torstol', paste: 'Aga', quantity: 44 }
];

export const mixologyHerbs: MixologyHerb[] = baseHerbs.flatMap(({ base, paste, quantity, unf }) => [
	{ name: base, paste, quantity },
	{ name: unf ?? `${base} potion (unf)`, paste, quantity }
]);

export interface MixologyContract {
	name: string;
	pasteSequence: MixologyPaste[];
	requiredLevel: number;
	xp: number;
	weight: number;
}

export interface WeightedItem {
	weight: number;
}

export const mixologyContracts: MixologyContract[] = [
	{
		name: 'Alco-AugmentAtor',
		pasteSequence: ['Aga', 'Aga', 'Aga'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'Mammoth-Might Mix',
		pasteSequence: ['Mox', 'Mox', 'Mox'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'LipLack Liquor',
		pasteSequence: ['Lye', 'Lye', 'Lye'],
		requiredLevel: 60,
		xp: 190,
		weight: 5
	},
	{
		name: 'Mystic Mana Amalgam',
		pasteSequence: ['Mox', 'Mox', 'Aga'],
		requiredLevel: 63,
		xp: 215,
		weight: 4
	},
	{
		name: "Marley's MoonLight",
		pasteSequence: ['Mox', 'Mox', 'Lye'],
		requiredLevel: 66,
		xp: 240,
		weight: 4
	},
	{
		name: 'Azure Aura Mix',
		pasteSequence: ['Aga', 'Aga', 'Mox'],
		requiredLevel: 69,
		xp: 265,
		weight: 4
	},
	{
		name: 'AquaLux Amalgam',
		pasteSequence: ['Aga', 'Lye', 'Aga'],
		requiredLevel: 72,
		xp: 290,
		weight: 4
	},
	{
		name: 'MegaLite Liquid',
		pasteSequence: ['Mox', 'Lye', 'Lye'],
		requiredLevel: 75,
		xp: 315,
		weight: 4
	},
	{
		name: 'Anti-Leech Lotion',
		pasteSequence: ['Aga', 'Lye', 'Lye'],
		requiredLevel: 78,
		xp: 340,
		weight: 4
	},
	{
		name: 'MixALot',
		pasteSequence: ['Mox', 'Aga', 'Lye'],
		requiredLevel: 81,
		xp: 365,
		weight: 3
	}
];

export const masteringMixologyBuyables = [
	{
		item: Items.getOrThrow('Apprentice potion pack'),
		cost: { Mox: 420, Aga: 70, Lye: 30 },
		requiredLevel: 60
	},
	{
		item: Items.getOrThrow('Adept potion pack'),
		cost: { Mox: 180, Aga: 440, Lye: 70 },
		requiredLevel: 70
	},
	{
		item: Items.getOrThrow('Expert potion pack'),
		cost: { Mox: 410, Aga: 320, Lye: 480 },
		requiredLevel: 85
	},
	{
		item: Items.getOrThrow('Prescription goggles'),
		cost: { Mox: 8600, Aga: 7000, Lye: 9350 }
	},
	{ item: Items.getOrThrow('Alchemist labcoat'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: Items.getOrThrow('Alchemist pants'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: Items.getOrThrow('Alchemist gloves'), cost: { Mox: 2250, Aga: 2800, Lye: 3700 } },
	{ item: Items.getOrThrow('Reagent pouch'), cost: { Mox: 13800, Aga: 11200, Lye: 15100 } },
	{ item: Items.getOrThrow('Potion storage'), cost: { Mox: 7750, Aga: 6300, Lye: 8950 } },
	{
		item: Items.getOrThrow('Chugging barrel (disassembled)'),
		cost: { Mox: 17250, Aga: 14000, Lye: 18600 }
	},
	{ item: Items.getOrThrow("Alchemist's amulet"), cost: { Mox: 6900, Aga: 5650, Lye: 7400 } },
	{ item: Items.getOrThrow('Aldarium'), cost: { Mox: 80, Aga: 60, Lye: 90 } }
];

export function createMixologyPoints(): MixologyPoints {
	return { Mox: 0, Lye: 0, Aga: 0 };
}

export function getMixologyContractPasteCounts(pasteSequence: readonly MixologyPaste[]): MixologyPoints {
	const counts = createMixologyPoints();
	for (const paste of pasteSequence) counts[paste] += mixologyPastePerPotionStep;
	return counts;
}

export function getMixologyContractCost(pasteSequence: readonly MixologyPaste[]): Bank {
	const cost = new Bank();
	for (const [paste, quantity] of Object.entries(getMixologyContractPasteCounts(pasteSequence))) {
		if (quantity > 0) cost.add(`${paste} paste`, quantity);
	}
	return cost;
}

export function calcMixologyContractBasePoints(pasteSequence: readonly MixologyPaste[]): MixologyPoints {
	const counts = createMixologyPoints();
	for (const paste of pasteSequence) counts[paste]++;

	const unique = Object.values(counts).filter(c => c > 0).length;
	const points: MixologyPoints = {
		Mox: counts.Mox * mixologyPastePerPotionStep,
		Lye: counts.Lye * mixologyPastePerPotionStep,
		Aga: counts.Aga * mixologyPastePerPotionStep
	};

	if (unique === 1) {
		const only = pasteSequence[0];
		points.Mox = points.Lye = points.Aga = 0;
		points[only] = mixologyPastePerPotionStep * 2;
	} else if (unique === 3) {
		points.Mox *= 2;
		points.Lye *= 2;
		points.Aga *= 2;
	}

	return points;
}

export function calcMixologyHandInPoints(batch: readonly MixologyPoints[]): MixologyPoints {
	const points = batch.reduce(
		(total, contractPoints) => ({
			Mox: total.Mox + contractPoints.Mox,
			Lye: total.Lye + contractPoints.Lye,
			Aga: total.Aga + contractPoints.Aga
		}),
		createMixologyPoints()
	);

	const multiplier =
		batch.length >= mixologyContractBatchSize
			? mixologyThreeOrderBonus
			: batch.length === 2
				? mixologyTwoOrderBonus
				: 1;
	return {
		Mox: Math.floor(points.Mox * multiplier),
		Lye: Math.floor(points.Lye * multiplier),
		Aga: Math.floor(points.Aga * multiplier)
	};
}

export function getMixologyContractDuration(base: number): number {
	const variance = 0.1;
	const factor = 1 + (Math.random() * 2 - 1) * variance;
	return base * factor;
}

export function masteringMixologyWeightedRandom<T extends WeightedItem>(items: readonly T[]): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = Math.random() * total;
	for (const item of items) {
		if (roll < item.weight) return item;
		roll -= item.weight;
	}
	return items[0];
}

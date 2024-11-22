export interface FishDropTable {
	item: string;
	qty: [number, number];
	low: number;
	high: number;
	req: number;
}

// Uses the skilling success rate formula: https://oldschool.runescape.wiki/w/Skilling_success_rate
export function chanceOfFish(fishLvl: number, low: number, high: number) {
	const num1: number = (low * (99 - fishLvl)) / 98;
	const num2: number = (high * (fishLvl - 1)) / 98;

	const chanceOfSuccess = (num1 + num2 + 1) / 256;

	return chanceOfSuccess * 100;
}

export const BrimstoneChestFish: FishDropTable[] = [
	{
		item: 'Raw manta ray',
		qty: [80, 160],
		low: -10,
		high: 20,
		req: 31
	},
	{
		item: 'Raw sea turtle',
		qty: [80, 200],
		low: -10,
		high: 50,
		req: 17
	},
	{
		item: 'Raw shark',
		qty: [100, 250],
		low: -60,
		high: 140,
		req: 27
	},
	{
		item: 'Raw monkfish',
		qty: [100, 300],
		low: 0,
		high: 170,
		req: 1
	},
	{
		item: 'Raw swordfish',
		qty: [100, 300],
		low: 30,
		high: 200,
		req: 1
	},
	{
		item: 'Raw lobster',
		qty: [100, 350],
		low: 70,
		high: 270,
		req: 1
	},
	{
		item: 'Raw tuna',
		qty: [100, 350],
		low: 225,
		high: 324,
		req: 1
	}
];

export const LarransSmallChestFish: FishDropTable[] = [
	{
		item: 'Raw manta ray',
		qty: [81, 177],
		low: -10,
		high: 20,
		req: 31
	},
	{
		item: 'Raw sea turtle',
		qty: [81, 177],
		low: -10,
		high: 50,
		req: 17
	},
	{
		item: 'Raw shark',
		qty: [126, 250],
		low: -60,
		high: 140,
		req: 27
	},
	{
		item: 'Raw monkfish',
		qty: [162, 297],
		low: 0,
		high: 170,
		req: 1
	},
	{
		item: 'Raw swordfish',
		qty: [113, 264],
		low: 30,
		high: 200,
		req: 1
	},
	{
		item: 'Raw lobster',
		qty: [163, 342],
		low: 70,
		high: 270,
		req: 1
	},
	{
		item: 'Raw tuna',
		qty: [112, 307],
		low: 225,
		high: 324,
		req: 1
	}
];

export const LarransBigChestFish: FishDropTable[] = [
	{
		item: 'Raw manta ray',
		qty: [120, 240],
		low: -10,
		high: 20,
		req: 31
	},
	{
		item: 'Raw sea turtle',
		qty: [120, 300],
		low: -10,
		high: 50,
		req: 17
	},
	{
		item: 'Raw shark',
		qty: [150, 375],
		low: -60,
		high: 140,
		req: 27
	},
	{
		item: 'Raw monkfish',
		qty: [150, 450],
		low: 0,
		high: 170,
		req: 1
	},
	{
		item: 'Raw swordfish',
		qty: [150, 450],
		low: 30,
		high: 200,
		req: 1
	},
	{
		item: 'Raw lobster',
		qty: [150, 525],
		low: 70,
		high: 270,
		req: 1
	},
	{
		item: 'Raw tuna',
		qty: [150, 525],
		low: 225,
		high: 324,
		req: 1
	}
];

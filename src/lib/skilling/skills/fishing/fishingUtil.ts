import type { RNGProvider } from '@oldschoolgg/rng';
import { round } from '@oldschoolgg/toolkit';
import { EItem } from 'oldschooljs';

import type { GearBank } from '@/lib/structures/GearBank.js';

const anglerItemsArr = [
	{
		id: EItem.ANGLER_HAT,
		boost: 0.4
	},
	{
		id: EItem.ANGLER_TOP,
		boost: 0.8
	},
	{
		id: EItem.ANGLER_WADERS,
		boost: 0.6
	},
	{
		id: EItem.ANGLER_BOOTS,
		boost: 0.2
	}
] as const;

const anglerItems = anglerItemsArr.map(item => [item.id, item.boost] as const);

const leapingGuttingConfig: Record<
	number,
	{
		xp: number;
		successChance(level: number): number;
		baitPerSuccess: number;
	}
> = {
	[EItem.LEAPING_TROUT]: {
		xp: 10,
		successChance: level => Math.min(level * 0.0067, 1),
		baitPerSuccess: 1.5
	},
	[EItem.LEAPING_SALMON]: {
		xp: 10,
		successChance: level => Math.min(level * 0.0125, 1),
		baitPerSuccess: 1.75
	},
	[EItem.LEAPING_STURGEON]: {
		xp: 15,
		successChance: level => Math.min(level * 0.0125, 1),
		baitPerSuccess: 11 / 6
	}
};

function calcRadasBlessingBoost(gearBank: GearBank) {
	const blessingBoosts = [
		["Rada's blessing 4", 8],
		["Rada's blessing 3", 6],
		["Rada's blessing 2", 4],
		["Rada's blessing 1", 2]
	];

	for (const [itemName, boostPercent] of blessingBoosts) {
		if (gearBank.hasEquipped(itemName)) {
			return { blessingEquipped: true, blessingChance: boostPercent as number };
		}
	}
	return { blessingEquipped: false, blessingChance: 0 };
}

const minnowQuantity: Record<number, [number, number]> = {
	99: [10, 14],
	95: [11, 13],
	90: [10, 13],
	85: [10, 11],
	1: [10, 10]
};

function calcMinnowQuantityRange(gearBank: GearBank): [number, number] {
	for (const [level, quantities] of Object.entries(minnowQuantity).reverse()) {
		if (gearBank.skillsAsLevels.fishing >= Number.parseInt(level)) {
			return quantities;
		}
	}
	return [10, 10];
}

function calcAnglerBoostPercent(gearBank: GearBank) {
	const equippedPieces = anglerItemsArr.filter(item => gearBank.gear.skilling.hasEquipped(item.id));
	if (equippedPieces.length === anglerItemsArr.length) {
		return 2.5;
	}
	const boostPercent = equippedPieces.reduce((total, item) => total + item.boost, 0);
	return round(boostPercent, 1);
}

type AnglerBonusRounding = 'none' | 'ceil' | 'floor';

function calcAnglerBonusXP({
	gearBank,
	xp,
	roundingMethod = 'none'
}: {
	gearBank: GearBank;
	xp: number;
	roundingMethod?: AnglerBonusRounding;
}) {
	const percent = calcAnglerBoostPercent(gearBank);
	if (percent <= 0 || xp <= 0) {
		return { percent, bonusXP: 0, totalXP: xp };
	}
	let bonusXP = (xp * percent) / 100;
	switch (roundingMethod) {
		case 'ceil':
			bonusXP = Math.ceil(bonusXP);
			break;
		case 'floor':
			bonusXP = Math.floor(bonusXP);
			break;
		default:
			break;
	}
	return { percent, bonusXP, totalXP: xp + bonusXP };
}

function calcLeapingExpectedCookingXP({
	id,
	quantity,
	cookingLevel,
	xpPerSuccess,
	rng
}: {
	id: number;
	quantity: number;
	cookingLevel: number;
	xpPerSuccess?: number;
	rng?: RNGProvider;
}) {
	if (quantity <= 0) {
		return 0;
	}
	const config = leapingGuttingConfig[id];
	if (!config) {
		return 0;
	}
	const xp = xpPerSuccess ?? config.xp;
	const chance = config.successChance(cookingLevel);
	const expectedSuccesses = quantity * chance;
	let successes = Math.floor(expectedSuccesses);
	const fractional = expectedSuccesses - successes;
	if (fractional > 0) {
		if (rng) {
			if (rng.rand() < fractional) {
				successes++;
			}
		} else if (fractional >= 0.5) {
			successes++;
		}
	}
	return successes * xp;
}

function calcLeapingExpectedBait(id: number, quantity: number, cookingLevel: number) {
	if (quantity <= 0) {
		return 0;
	}
	const config = leapingGuttingConfig[id];
	if (!config) {
		return 0;
	}
	const chance = config.successChance(cookingLevel);
	return quantity * chance * config.baitPerSuccess;
}

export {
	calcRadasBlessingBoost,
	calcMinnowQuantityRange,
	calcAnglerBoostPercent,
	calcAnglerBonusXP,
	anglerItems,
	anglerItemsArr,
	calcLeapingExpectedCookingXP,
	calcLeapingExpectedBait
};

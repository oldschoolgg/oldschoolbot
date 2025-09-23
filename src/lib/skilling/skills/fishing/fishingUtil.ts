import { round } from 'e';
import { itemID } from 'oldschooljs';

import type { GearBank } from '@/lib/structures/GearBank.js';

const anglerItems = [
	[itemID('Angler hat'), 0.4],
	[itemID('Angler top'), 0.8],
	[itemID('Angler waders '), 0.6],
	[itemID('Angler boots'), 0.2]
] as const;

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

const minnowQuantity: { [key: number]: [number, number] } = {
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
	const skillingSetup = gearBank.gear.skilling;
	let amountEquipped = 0;
	let boostPercent = 0;
	for (const [id, percent] of anglerItems) {
		if (skillingSetup.hasEquipped([id])) {
			boostPercent += percent;
			amountEquipped++;
		}
	}
	if (amountEquipped === 4) {
		boostPercent += 0.5;
	}
	return round(boostPercent, 1);
}

export { anglerItems, calcAnglerBoostPercent, calcMinnowQuantityRange, calcRadasBlessingBoost };

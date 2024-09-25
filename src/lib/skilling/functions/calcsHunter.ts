import { Time } from 'e';
import { LootTable } from 'oldschooljs';

import { percentChance } from '../../util';
import type { Creature } from '../types';

export function calcLootXPHunting(
	currentLevel: number,
	creature: Creature,
	quantity: number,
	usingStaminaPotion: boolean,
	graceful: boolean,
	experienceScore: number
): [number, number, number] {
	let xpReceived = 0;
	let successful = 0;

	let chanceOfSuccess = creature.slope * currentLevel + creature.intercept;

	if (creature.name === 'Crystal impling') {
		chanceOfSuccess = 20;
		if (graceful) {
			chanceOfSuccess *= 1.05;
		}
		if (usingStaminaPotion) {
			chanceOfSuccess *= 1.2;
		}

		const timeInSeconds = creature.catchTime * Time.Second;
		const experienceFactor = experienceScore / (Time.Hour / timeInSeconds);

		const maxPercentIncrease = 10;
		const percentIncrease = Math.min(Math.floor(experienceFactor), maxPercentIncrease);

		chanceOfSuccess += chanceOfSuccess * (percentIncrease / 100);
	}

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			continue;
		}
		successful++;

		xpReceived += creature.hunterXP + (creature.name === 'Herbiboar' ? 27 * (currentLevel - 80) : 0);
	}

	return [successful, xpReceived, chanceOfSuccess];
}

export function generateHerbiTable(currentHerbLvl: number, gotMagicSec: boolean): LootTable {
	const herbiTable = new LootTable();
	if (currentHerbLvl < 31) return herbiTable;
	herbiTable.tertiary(6500, 'Herbi');
	const baseYield = gotMagicSec ? 2 : 1;
	herbiTable
		.add('Grimy guam leaf', [baseYield, 4])
		.add('Grimy irit leaf', [baseYield, 4])
		.add('Grimy avantoe', [baseYield, 4])
		.add('Grimy kwuarm', [baseYield, 4])
		.add('Grimy cadantine', [baseYield, 4]);

	if (currentHerbLvl >= 31 && currentHerbLvl <= 80) {
		herbiTable.add('Grimy marrentill', [baseYield, 4]);
	}

	if (currentHerbLvl >= 31 && currentHerbLvl <= 78) {
		herbiTable.add('Grimy tarromin', [baseYield, 4]).add('Grimy harralander', [baseYield, 4]);
	}

	if (currentHerbLvl >= 36) {
		herbiTable.add('Grimy ranarr weed', [baseYield, 4]);
	}

	if (currentHerbLvl >= 41) {
		herbiTable.add('Grimy lantadyme', [baseYield, 4]);
	}

	if (currentHerbLvl >= 62) {
		herbiTable.add('Grimy dwarf weed', [baseYield, 4]);
	}

	if (currentHerbLvl >= 75) {
		herbiTable.add('Grimy snapdragon', [baseYield, 4]);
	}

	if (currentHerbLvl >= 77) {
		herbiTable.add('Grimy torstol', [baseYield, 4]);
	}

	return herbiTable;
}

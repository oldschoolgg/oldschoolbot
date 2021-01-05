import LootTable from 'oldschooljs/dist/structures/LootTable';

import { percentChance } from '../../util';
import { Creature } from '../types';
import { petRates } from './../../../commands/OSRS_Utility/petrate';

export function calcLootXPHunting(
	currentLevel: number,
	creature: Creature,
	quantity: number
): [number, number, number] {
	let xpReceived = 0;
	let successful = 0;

	const chanceOfSuccess = creature.slope * currentLevel + creature.intercept;

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			continue;
		}
		successful++;

		xpReceived +=
			creature.hunterXp + (creature.name === 'Herbiboar' ? 27 * (currentLevel - 80) : 0);
	}

	return [successful, xpReceived, chanceOfSuccess];
}

export function calcBabyChinchompaChance(currentLevel: number, creature: Creature): number {
	const baseRate =
		creature.name === 'Chinchompa'
			? petRates.hunter['Grey chinchompas']
			: creature.name === 'Carnivorous chinchompa'
			? petRates.hunter['Red chinchompas']
			: petRates.hunter['Black chinchompas'];
	const babyChinChance = baseRate - currentLevel * 25;

	return babyChinChance;
}

export function generateHerbiTable(
	currentHerbLvl: number,
	creature: Creature,
	magicSec: boolean
): LootTable {
	let herbiTable = creature.table;
	let gotMagicSec = magicSec ? 2 : 1;
	herbiTable
		.add('Grimy guam leaf', [gotMagicSec, 4])
		.add('Grimy irit leaf', [gotMagicSec, 4])
		.add('Grimy avantoe', [gotMagicSec, 4])
		.add('Grimy kwuarm', [gotMagicSec, 4])
		.add('Grimy cadantine', [gotMagicSec, 4]);

	if (currentHerbLvl >= 31 && currentHerbLvl <= 80) {
		herbiTable.add('Grimy marrentill', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 31 && currentHerbLvl <= 78) {
		herbiTable
			.add('Grimy tarromin', [gotMagicSec, 4])
			.add('Grimy harralander', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 36) {
		herbiTable.add('Grimy ranarr weed', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 41) {
		herbiTable.add('Grimy lantadyme', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 62) {
		herbiTable.add('Grimy dwarf weed', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 75) {
		herbiTable.add('Grimy snapdragon', [gotMagicSec, 4]);
	}

	if (currentHerbLvl >= 77) {
		herbiTable.add('Grimy torstol', [gotMagicSec, 4]);
	}

	return herbiTable;
}

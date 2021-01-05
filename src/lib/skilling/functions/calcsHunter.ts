import { percentChance } from '../../util';
import { Creature } from '../types';

export function calcLootXPHunting(
	currentLevel: number,
	creature: Creature,
	quantity: number,
): [number, number, number] {
	let xpReceived = 0;
	let successful = 0;

	const chanceOfSuccess = (creature.slope * currentLevel + creature.intercept);

	for (let i = 0; i < quantity; i++) {
		if (!percentChance(chanceOfSuccess)) {
			continue;
		}
		successful++;

		xpReceived += creature.hunterXp;
	}

	return [successful, xpReceived, chanceOfSuccess];
}


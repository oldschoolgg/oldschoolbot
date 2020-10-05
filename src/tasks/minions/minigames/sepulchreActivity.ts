import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';

export default class extends Task {
	async run({ channelID, quantity, floors }: SepulchreActivityTaskOptions) {
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			for (const floor of sepulchreFloors) {
				if (roll(floor.petChance)) {
					loot.add('Giant squirrel');
				}

				if (floor.id === 5) {
					loot.add(GrandHallowedCoffin);
				}
			}
		}
	}
}

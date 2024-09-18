import '../../lib/customItems/customItems';
import '../data/itemAliases';

import { randInt, roll } from 'e';
import { Bank, Misc } from 'oldschooljs';

import type { CasketWorkerArgs } from '.';
import { ClueTiers } from '../clues/clueTiers';
import type { ItemBank } from '../types';

if (global.prisma) {
	throw new Error('Prisma is loaded in the casket worker!');
}

export default async ({ clueTierID, quantity }: CasketWorkerArgs): Promise<[ItemBank, string]> => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;

	const loot = clueTier.table.open(quantity, undefined, new Bank());

	for (let i = 0; i < quantity; i++) {
		const qty = randInt(1, 3);
		loot.add(clueTier.table.open(qty, undefined, new Bank()));
	}

	let mimicNumber = 0;
	if (clueTier.mimicChance) {
		for (let i = 0; i < quantity; i++) {
			if (roll(clueTier.mimicChance)) {
				loot.add(Misc.Mimic.open(clueTier.name as 'master' | 'elite'));
				mimicNumber++;
			}
		}
	}

	const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${quantity > 1 ? 's' : ''}${
		mimicNumber > 0
			? ` and defeated ${mimicNumber} 
					mimic${mimicNumber > 1 ? 's' : ''}`
			: ''
	}`;

	return [loot.toJSON(), opened];
};

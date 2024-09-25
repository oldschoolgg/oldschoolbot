import '../data/itemAliases';

import { roll } from 'e';
import { Bank } from 'oldschooljs';

import type { CasketWorkerArgs } from '.';
import { ClueTiers } from '../clues/clueTiers';
import { getMimicTable } from '../util';

if (global.prisma || global.redis) {
	throw new Error('Prisma/Redis is loaded in the casket worker!');
}

export default async ({ clueTierID, quantity }: CasketWorkerArgs): Promise<[Bank, string]> => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;
	const loot = clueTier.table.roll(quantity);
	let mimicNumber = 0;
	if (clueTier.mimicChance) {
		const mimicTable = getMimicTable(clueTier.name as 'master' | 'elite');
		for (let i = 0; i < quantity; i++) {
			if (roll(clueTier.mimicChance)) {
				mimicTable.roll(1, { targetBank: loot });
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

	return [new Bank(loot), opened];
};

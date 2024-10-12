import '../data/itemAliases';

import { roll } from 'e';
import { EliteMimicTable, type ItemBank, MasterMimicTable } from 'oldschooljs';

import type { CasketWorkerArgs } from '.';
import { ClueTiers } from '../clues/clueTiers';

if (global.prisma || global.redis) {
	throw new Error('Prisma/Redis is loaded in the casket worker!');
}

export default async ({ clueTierID, quantity }: CasketWorkerArgs): Promise<[ItemBank, string]> => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;
	const loot = clueTier.table.roll(quantity);
	let mimicNumber = 0;
	if (clueTier.mimicChance) {
		const table = clueTier.name === 'Master' ? MasterMimicTable : EliteMimicTable;
		for (let i = 0; i < quantity; i++) {
			if (roll(clueTier.mimicChance)) {
				loot.add(table.roll());
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

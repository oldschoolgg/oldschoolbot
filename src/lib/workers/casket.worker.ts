import '../../lib/customItems/customItems';
import '../data/itemAliases';

import { randInt, roll } from 'e';
import { Bank, EliteMimicTable, MasterMimicTable } from 'oldschooljs';

import type { CasketWorkerArgs } from '.';
import { ClueTiers } from '../clues/clueTiers';
import type { ItemBank } from '../types';

if (global.prisma) {
	throw new Error('Prisma is loaded in the casket worker!');
}

export default async ({ clueTierID, quantity }: CasketWorkerArgs): Promise<[ItemBank, string]> => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;

	let bsoBonus = 0;
	for (let i = 0; i < quantity; i++) {
		bsoBonus += randInt(1, 3);
	}

	const loot = clueTier.table.roll(quantity + bsoBonus, { cl: new Bank() });

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

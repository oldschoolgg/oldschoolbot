import '../../lib/customItems/customItems.js';
import '../data/itemAliases.js';

import { randInt, roll } from 'e';
import type { ItemBank } from 'oldschooljs';
import { Bank, EliteMimicTable, MasterMimicTable } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import type { CasketWorkerArgs } from '@/lib/workers/index.js';

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

	const opened = `Loot from ${quantity} ${clueTier.name} Casket${quantity > 1 ? 's' : ''}${
		mimicNumber > 0 ? ` and ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
	}`;

	return [loot.toJSON(), opened];
};

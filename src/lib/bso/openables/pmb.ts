import { LootTable } from 'oldschooljs';

import { allPetsCL } from '@/lib/data/CollectionsExport.js';

const MR_E_DROPRATE_FROM_PMB = 200;

const IronmanDCPetsTable = new LootTable()
	.add('Hoppy')
	.add('Craig')
	.add('Smokey')
	.add('Flappy')
	.add('Cob')
	.add('Gregoyle')
	.add('Kuro');

export const PMBTable = new LootTable().oneIn(MR_E_DROPRATE_FROM_PMB, 'Mr. E');
for (const pet of allPetsCL) {
	PMBTable.add(pet);
}

export const IronmanPMBTable = new LootTable().oneIn(10, IronmanDCPetsTable).add(PMBTable);

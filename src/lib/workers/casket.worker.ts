import { roll } from 'e';
import { Misc } from 'oldschooljs';
import { addBanks } from 'oldschooljs/dist/util';

import ClueTiers from '../minions/data/clueTiers';
import { ItemBank } from '../types';
import { CasketWorkerArgs } from '.';

export default ({ clueTierID, quantity }: CasketWorkerArgs): [ItemBank, string] => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;
	let loot = clueTier.table.open(quantity);
	let mimicNumber = 0;
	if (clueTier.mimicChance) {
		for (let i = 0; i < quantity; i++) {
			if (roll(clueTier.mimicChance)) {
				loot = addBanks([Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot]);
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

	return [loot, opened];
};

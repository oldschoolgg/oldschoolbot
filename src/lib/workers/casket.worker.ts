import '../../lib/customItems/customItems';

import { roll } from 'e';
import { Bank, Misc } from 'oldschooljs';

import { ClueTiers } from '../clues/clueTiers';
import { CasketWorkerArgs } from '.';

export default ({ clueTierID, quantity }: CasketWorkerArgs): [Bank, string] => {
	const clueTier = ClueTiers.find(tier => tier.id === clueTierID)!;
	let loot = clueTier.table.open(quantity);
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

	return [new Bank(loot), opened];
};

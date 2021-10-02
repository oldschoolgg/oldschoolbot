import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { stringMatches } from '../../util';
import Potions from '../data/potions';

export default function decantPotionFromBank(userBank: ItemBank, potion: string, dose: 1 | 2 | 3 | 4) {
	const potionToDecant = Potions.find(pot => stringMatches(pot.name, potion));
	if (!potionToDecant) {
		throw "You can't decant that!";
	}
	const potionsToRemove = new Bank();
	const potionsToAdd = new Bank();
	let sumOfPots = 0;
	let totalDosesToCreate = 0;

	for (let i = 0; i < potionToDecant.items.length; i++) {
		if (i === dose - 1) continue;
		let qty = userBank[potionToDecant.items[i]];
		if (qty > 0) {
			potionsToRemove.add(potionToDecant.items[i], qty);
			sumOfPots += qty;
			totalDosesToCreate += qty * (i + 1);
		}
	}

	if (!totalDosesToCreate) {
		throw `You don't have any **${potionToDecant.name}** to decant!`;
	}

	const newPotionDoseRequested = Math.floor(totalDosesToCreate / dose);
	const leftOverDoses = totalDosesToCreate % dose;
	if (newPotionDoseRequested) {
		potionsToAdd.add(potionToDecant.items[dose - 1], newPotionDoseRequested);
	}
	if (leftOverDoses) {
		potionsToAdd.add(potionToDecant.items[leftOverDoses - 1], 1);
	}

	return {
		potionsToAdd,
		potionsToRemove,
		sumOfPots,
		potionName: potionToDecant.name,
		finalUserBank: new Bank().add(userBank).add(potionsToAdd).remove(potionsToRemove)
	};
}

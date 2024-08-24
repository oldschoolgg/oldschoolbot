import { Bank } from 'oldschooljs';

import { stringMatches } from '../../util';
import Potions from '../data/potions';

export default function decantPotionFromBank(
	userBank: Bank,
	potion: string,
	dose: number
):
	| {
			potionsToAdd: Bank;
			potionsToRemove: Bank;
			sumOfPots: number;
			potionName: string;
			finalUserBank: Bank;
			error: null;
	  }
	| {
			error: string;
	  } {
	const potionToDecant = Potions.find(pot => stringMatches(pot.name, potion));
	if (!potionToDecant) {
		return { error: "That's not a valid potion that you can decant." };
	}
	if (potionToDecant.items.length === 2 && dose > 2) return { error: 'You can only decant mixes into 1 or 2 doses.' };
	const potionsToRemove = new Bank();
	const potionsToAdd = new Bank();
	let sumOfPots = 0;
	let totalDosesToCreate = 0;

	for (let i = 0; i < potionToDecant.items.length; i++) {
		if (i === dose - 1) continue;
		const qty = userBank.amount(potionToDecant.items[i]);
		if (qty > 0) {
			potionsToRemove.add(potionToDecant.items[i], qty);
			sumOfPots += qty;
			totalDosesToCreate += qty * (i + 1);
		}
	}

	if (!totalDosesToCreate) {
		return { error: `You don't have any **${potionToDecant.name}** to decant!` };
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
		finalUserBank: new Bank().add(userBank).add(potionsToAdd).remove(potionsToRemove),
		error: null
	};
}

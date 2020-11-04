import { ItemBank } from 'oldschooljs/dist/meta/types';

import { addBanks, removeBankFromBank, stringMatches } from '../../util';
import Potions from '../data/potions';

export default function decantPotionFromBank(
	userBank: ItemBank,
	potion: string,
	dose: 1 | 2 | 3 | 4
) {
	const potionToDecant = Potions.find(pot => stringMatches(pot.name, potion));
	if (!potionToDecant) {
		throw `You can't decant that!`;
	}
	const potionsToRemove: ItemBank = {};
	const potionsToAdd: ItemBank = {};
	let sumOfPots = 0;
	let totalDosesToCreate = 0;

	for (let i = 0; i < potionToDecant.items.length; i++) {
		if (i === dose - 1) continue;
		potionsToRemove[potionToDecant.items[i]] = userBank[potionToDecant.items[i]] ?? 0;
		sumOfPots += potionsToRemove[potionToDecant.items[i]];
		totalDosesToCreate += potionsToRemove[potionToDecant.items[i]] * (i + 1);
	}

	if (!totalDosesToCreate) {
		throw `You don't have any **${potionToDecant.name}** to decant!`;
	}

	const newPotionDoseRequested = Math.floor(totalDosesToCreate / dose);
	const leftOverDoses = totalDosesToCreate % dose;
	if (newPotionDoseRequested) {
		potionsToAdd[potionToDecant.items[dose - 1]] = newPotionDoseRequested;
	}
	if (leftOverDoses) {
		potionsToAdd[potionToDecant.items[leftOverDoses - 1]] = 1;
	}

	return {
		potionsToAdd,
		potionsToRemove,
		sumOfPots,
		potionName: potionToDecant.name,
		finalUserBank: addBanks([potionsToAdd, removeBankFromBank(userBank, potionsToRemove)])
	};
}

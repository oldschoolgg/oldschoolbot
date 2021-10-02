import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { birdsNestID, nestTable } from '../../simulation/birdsNest';
import { SkillsEnum } from '../../skilling/types';
import { addArrayOfNumbers, randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export default function addSkillingClueToLoot(
	user: KlasaUser,
	skill: SkillsEnum,
	quantity: number,
	clueChance: number,
	loot: Bank
) {
	const userLevel = user.skillLevel(skill);
	const chance = Math.floor(clueChance / (100 + userLevel));
	let nests = 0;
	const cluesTotalWeight = addArrayOfNumbers(clues.map(c => c[1]));

	for (let i = 0; i < quantity; i++) {
		if (skill === SkillsEnum.Woodcutting && roll(256)) {
			loot.add(nestTable.roll());
		}

		if (!roll(chance)) continue;
		let nextTier = false;
		let gotClue = false;
		let clueRoll = randFloat(0, cluesTotalWeight);
		for (const clue of clues) {
			if (clueRoll < clue[1] || nextTier) {
				//  This if block is ONLY for OSB.
				if (user.bank().amount(clue[0]) >= 1 || loot.amount(clue[0]) >= 1) {
					nextTier = true;
					continue;
				}

				nests++;
				gotClue = true;
				loot.add(clue[0]);
				break;
			}
			// Remove weighting to check next tier.
			clueRoll -= clue[1];
		}
		if (!gotClue && roll(1000)) {
			loot.add('Clue scroll (beginner)');
		}
	}
	if (skill === SkillsEnum.Woodcutting) {
		loot.add(birdsNestID, nests);
	}
	return loot;
}

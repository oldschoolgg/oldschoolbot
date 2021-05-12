import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { SkillsEnum } from '../../skilling/types';
import { randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

const clues = [
	[itemID('Clue scroll(easy)'), 4 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(elite)'), 1 / 10]
];

const birdsNestID = 5075;

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
	for (let i = 0; i < quantity; i++) {
		if (!roll(chance)) continue;
		let nextTier = false;
		let gotClue = false;
		for (const clue of clues) {
			if (nextTier || randFloat(0, 1) <= clue[1]) {
				if (user.numItemsInBankSync(clue[0]) >= 1 || loot.amount(clue[0]) >= 1) {
					nextTier = true;
					continue;
				}
				gotClue = true;
				nests++;
				loot.add(clue[0]);
				break;
			}
		}
		if (!gotClue && roll(1000)) {
			loot.add('Clue scroll(beginner)');
		}
	}
	if (skill === SkillsEnum.Woodcutting) {
		loot.add(birdsNestID, nests);
	}
	return loot;
}

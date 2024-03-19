import { sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { birdsNestID, nestTable, strungRabbitFootNestTable } from '../../simulation/birdsNest';
import { SkillsEnum } from '../../skilling/types';
import { randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

const clues = [
	[itemID('Clue scroll (grandmaster)'), 0.2 / 10],
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export default function addSkillingClueToLoot(
	userOrLevel: MUser | number,
	skill: SkillsEnum,
	quantity: number,
	clueChance: number,
	loot: Bank,
	clueNestsOnly?: boolean,
	strungRabbitFoot?: boolean,
	wcCapeNestBoost?: boolean
) {
	const userLevel = typeof userOrLevel === 'number' ? userOrLevel : userOrLevel.skillLevel(skill);
	const chance = Math.floor(clueChance / (100 + userLevel));
	const nestChance = wcCapeNestBoost ? Math.floor(256 * 0.9) : 256;
	const cluesTotalWeight = sumArr(clues.map(c => c[1]));
	let nests = 0;

	for (let i = 0; i < quantity; i++) {
		if (skill === SkillsEnum.Woodcutting && !clueNestsOnly && roll(nestChance)) {
			if (strungRabbitFoot) {
				loot.add(strungRabbitFootNestTable.roll());
				continue;
			} else {
				loot.add(nestTable.roll());
				continue;
			}
		}

		if (!roll(chance)) continue;
		let nextTier = false;
		let gotClue = false;
		let clueRoll = randFloat(0, cluesTotalWeight);
		for (const clue of clues) {
			if (clueRoll < clue[1] || nextTier) {
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
			gotClue = true;
		}
	}
	if (skill === SkillsEnum.Woodcutting) {
		loot.add(birdsNestID, nests);
	}
	return loot;
}

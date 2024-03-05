import { percentChance, sumArr } from 'e';
import { Bank } from 'oldschooljs';

import { BOT_TYPE } from '../../constants';
import {
	birdsNestID,
	eggNest,
	nestTable,
	ringNests,
	strungRabbitFootNestTable,
	treeSeedsNest
} from '../../simulation/birdsNest';
import { SkillsEnum } from '../../skilling/types';
import { randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export default function addSkillingClueToLoot(
	user: MUser,
	skill: SkillsEnum,
	quantity: number,
	clueChance: number,
	loot: Bank,
	clueNestsOnly?: boolean,
	strungRabbitFoot?: boolean,
	twitcherSetting?: string,
	wcCapeNestBoost?: boolean
) {
	const userLevel = user.skillLevel(skill);
	const chance = Math.floor(clueChance / (100 + userLevel));
	let nests = 0;
	const nestChance = wcCapeNestBoost ? Math.floor(256 * 0.9) : 256;
	const cluesTotalWeight = sumArr(clues.map(c => c[1]));

	for (let i = 0; i < quantity; i++) {
		let twitcherClueNest = false;
		if (skill === SkillsEnum.Woodcutting && !clueNestsOnly && roll(nestChance)) {
			if (twitcherSetting && percentChance(20)) {
				switch (twitcherSetting) {
					case 'egg':
						loot.add(eggNest.roll());
						nests++;
						continue;
					case 'seed':
						loot.add(treeSeedsNest.roll());
						nests++;
						continue;
					case 'ring':
						loot.add(ringNests.roll());
						nests++;
						continue;
					case 'clue':
						twitcherClueNest = true;
						break;
				}
			} else if (strungRabbitFoot) {
				loot.add(strungRabbitFootNestTable.roll());
				continue;
			} else {
				loot.add(nestTable.roll());
				continue;
			}
		}

		if (!roll(chance) && !twitcherClueNest) continue;
		let nextTier = false;
		let gotClue = false;
		let clueRoll = randFloat(0, cluesTotalWeight);
		for (const clue of clues) {
			if (clueRoll < clue[1] || nextTier) {
				if (BOT_TYPE === 'OSB' && (user.bank.amount(clue[0]) >= 1 || loot.amount(clue[0]) >= 1)) {
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
			gotClue = true;
		}
		if (twitcherClueNest && !gotClue) {
			if (strungRabbitFoot) {
				loot.add(strungRabbitFootNestTable.roll());
				continue;
			} else {
				loot.add(nestTable.roll());
				continue;
			}
		}
	}
	if (skill === SkillsEnum.Woodcutting) {
		loot.add(birdsNestID, nests);
	}
	return loot;
}

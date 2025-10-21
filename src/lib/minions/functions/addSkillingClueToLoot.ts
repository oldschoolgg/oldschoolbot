import { percentChance, randFloat, roll } from '@oldschoolgg/rng';
import { sumArr } from '@oldschoolgg/toolkit';
import { type Bank, itemID } from 'oldschooljs';

import {
	birdsNestID,
	eggNest,
	nestTable,
	ringNests,
	strungRabbitFootNestTable,
	treeSeedsNest
} from '@/lib/simulation/birdsNest.js';
import type { SkillNameType } from '@/lib/skilling/types.js';
import { GearBank } from '@/lib/structures/GearBank.js';

const clues = [
	[itemID('Clue scroll(elite)'), 1 / 10],
	[itemID('Clue scroll(hard)'), 2 / 10],
	[itemID('Clue scroll(medium)'), 3 / 10],
	[itemID('Clue scroll(easy)'), 4 / 10]
];

export default function addSkillingClueToLoot(
	user: MUser | GearBank,
	skill: SkillNameType,
	quantity: number,
	clueChance: number,
	loot: Bank,
	clueNestsOnly?: boolean,
	strungRabbitFoot?: boolean,
	twitcherSetting?: string,
	wcCapeNestBoost?: boolean
) {
	const userLevel = user instanceof GearBank ? user.skillsAsLevels[skill] : user.skillLevel(skill);
	const nestChance = wcCapeNestBoost ? Math.floor(256 * 0.9) : 256;
	const cluesTotalWeight = sumArr(clues.map(c => c[1]));
	let chance = Math.floor(clueChance / (100 + userLevel));
	let nests = 0;

	if (skill === 'woodcutting' && twitcherSetting === 'clue') {
		chance = Math.floor((clueChance * 0.8) / (100 + userLevel));
	}

	for (let i = 0; i < quantity; i++) {
		if (skill === 'woodcutting' && !clueNestsOnly && roll(nestChance)) {
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
				}
			} else if (strungRabbitFoot) {
				loot.add(strungRabbitFootNestTable.roll());
				continue;
			} else {
				loot.add(nestTable.roll());
				continue;
			}
		}

		if (!roll(chance)) continue;
		let gotClue = false;
		let clueRoll = randFloat(0, cluesTotalWeight);
		for (const clue of clues) {
			if (clueRoll < clue[1]) {
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
	if (skill === 'woodcutting') {
		loot.add(birdsNestID, nests);
	}
	return loot;
}

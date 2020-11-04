import { KlasaUser } from 'klasa';

import { SkillsEnum } from '../../skilling/types';
import { ItemBank } from '../../types';
import { randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

const clues = Object.entries({
	[itemID('Clue scroll(elite)')]: 1 / 10,
	[itemID('Clue scroll(hard)')]: 2 / 10,
	[itemID('Clue scroll(medium)')]: 3 / 10,
	[itemID('Clue scroll(easy)')]: 4 / 10
}).reverse();

export default function addSkillingClueToLoot(
	user: KlasaUser,
	skill: SkillsEnum,
	quantity: number,
	clueChance: number,
	loot: ItemBank
) {
	const userLevel = user.skillLevel(skill);
	// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
	const chance = Math.floor(clueChance / (100 + userLevel));
	for (let i = 0; i < quantity; i++) {
		if (roll(chance)) {
			let nextTier = false;
			let gotClue = false;
			for (const clue of clues) {
				if (nextTier || randFloat(0, 1) <= clue[1]) {
					if (
						user.numItemsInBankSync(Number(clue[0])) >= 1 ||
						loot[Number(clue[0])] >= 1
					) {
						nextTier = true;
						continue;
					}
					gotClue = true;
					loot[Number(clue[0])] = (loot[Number(clue[0])] ?? 0) + 1;
					break;
				}
			}
			if (!gotClue && roll(1000)) {
				loot[itemID('Clue scroll(beginner)')] =
					(loot[itemID('Clue scroll(beginner)')] ?? 0) + 1;
			}
		}
	}
	return loot;
}

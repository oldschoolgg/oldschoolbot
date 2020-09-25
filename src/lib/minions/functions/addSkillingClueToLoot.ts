import { KlasaUser } from 'klasa';

import { SkillsEnum } from '../../skilling/types';
import { ItemBank } from '../../types';
import { randFloat, roll } from '../../util';
import itemID from '../../util/itemID';

export default function addSkillingClueToLoot(
	user: KlasaUser,
	quantity: number,
	clueChance: number,
	loot: ItemBank
) {
	const clues: Record<number, number> = {
		[itemID('Clue scroll(easy)')]: 4 / 10,
		[itemID('Clue scroll(medium)')]: 3 / 10,
		[itemID('Clue scroll(hard)')]: 2 / 10,
		[itemID('Clue scroll(elite)')]: 1 / 10,
		[itemID('Clue scroll(beginner)')]: 1 / 1000
	};
	const userLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const chance = Math.floor(clueChance / (100 + userLevel));
	for (let i = 0; i < quantity; i++) {
		if (roll(chance)) {
			for (const clue of Object.entries(clues)) {
				if (randFloat(0, 1) <= clue[1]) {
					loot[Number(clue[0])] = (loot[Number(clue[0])] ?? 0) + 1;
					break;
				}
			}
		}
	}
	return loot;
}

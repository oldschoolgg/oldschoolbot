import { KlasaUser } from 'klasa';

import { Rune, SkillsEnum } from '../types';

export function calcMaxRCQuantity(rune: Rune, user: KlasaUser) {
	const level = user.skillLevel(SkillsEnum.Runecraft);
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

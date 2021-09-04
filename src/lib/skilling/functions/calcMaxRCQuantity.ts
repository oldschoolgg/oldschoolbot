import { User } from 'discord.js';

import { Rune, SkillsEnum } from '../types';

export function calcMaxRCQuantity(rune: Rune, user: User) {
	const level = user.skillLevel(SkillsEnum.Runecraft);
	for (let i = rune.levels.length; i > 0; i--) {
		const [levelReq, qty] = rune.levels[i - 1];
		if (level >= levelReq) return qty;
	}

	return 0;
}

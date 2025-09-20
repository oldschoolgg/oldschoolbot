import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '@/lib/skilling/types.js';
import { calcConBonusXP } from './calcConBonusXP.js';
import Constructables from './constructables.js';

export const Construction = {
	aliases: ['con', 'construction'],
	id: SkillsEnum.Construction,
	emoji: Emoji.Construction,
	name: 'Construction',
	constructables: Constructables,
	util: {
		calcConBonusXP
	}
};

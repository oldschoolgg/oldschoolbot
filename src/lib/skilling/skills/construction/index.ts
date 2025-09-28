import { Emoji } from '@oldschoolgg/toolkit/constants';

import { defineSkill } from '@/lib/skilling/types.js';
import { calcConBonusXP } from './calcConBonusXP.js';
import Constructables from './constructables.js';

export const Construction = defineSkill({
	aliases: ['con', 'construction'],
	id: 'construction',
	emoji: Emoji.Construction,
	name: 'Construction',
	constructables: Constructables,
	util: {
		calcConBonusXP
	}
});

import { Emoji } from '@oldschoolgg/toolkit/constants';

import { calcConBonusXP } from './calcConBonusXP.js';
import Constructables from './constructables.js';

export const Construction = {
	aliases: ['con', 'construction'],
	id: 'construction',
	emoji: Emoji.Construction,
	name: 'Construction',
	constructables: Constructables,
	util: {
		calcConBonusXP
	}
};

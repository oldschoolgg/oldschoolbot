import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '../../types';
import { calcConBonusXP } from './calcConBonusXP';
import Constructables from './constructables';

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

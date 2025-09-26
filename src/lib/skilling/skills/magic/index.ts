import { Emoji } from '@oldschoolgg/toolkit/constants';

import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import { SkillsEnum } from '../../types';

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic',
	Castables,
	Enchantables
};

export default Magic;

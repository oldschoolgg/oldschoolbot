import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '@/lib/skilling/types.js';
import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic',
	Castables,
	Enchantables,
};

export default Magic;

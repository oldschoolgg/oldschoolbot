import { Emoji } from '@oldschoolgg/toolkit/constants';

import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';

const Magic = {
	aliases: ['mage', 'magic'],
	id: 'magic',
	emoji: Emoji.Magic,
	name: 'Magic',
	Enchantables,
	Castables
};

export default Magic;

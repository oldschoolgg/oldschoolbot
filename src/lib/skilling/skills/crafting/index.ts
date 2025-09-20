import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '@/lib/skilling/types.js';
import { Craftables } from './craftables/index.js';

const Crafting = {
	aliases: ['craft', 'crafting'],
	Craftables,
	id: SkillsEnum.Crafting,
	emoji: Emoji.Crafting,
	name: 'Crafting'
};

export default Crafting;

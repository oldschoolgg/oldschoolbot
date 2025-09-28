import { Emoji } from '@oldschoolgg/toolkit';

import { defineSkill } from '@/lib/skilling/types.js';
import { Craftables } from './craftables/index.js';

const Crafting = defineSkill({
	aliases: ['craft', 'crafting'],
	Craftables,
	id: 'crafting',
	emoji: Emoji.Crafting,
	name: 'Crafting'
});

export default Crafting;

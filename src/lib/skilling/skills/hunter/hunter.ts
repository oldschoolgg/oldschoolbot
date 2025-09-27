import { Emoji } from '@oldschoolgg/toolkit/constants';

import { defineSkill } from '@/lib/skilling/types.js';
import creatures from './creatures/index.js';

const Hunter = defineSkill({
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: 'hunter',
	emoji: Emoji.Hunter,
	name: 'Hunter'
});

export default Hunter;

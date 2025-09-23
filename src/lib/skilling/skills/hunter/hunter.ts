import { Emoji } from '@oldschoolgg/toolkit/constants';

import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { SkillsEnum } from '@/lib/skilling/types.js';

const Hunter = {
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: SkillsEnum.Hunter,
	emoji: Emoji.Hunter,
	name: 'Hunter'
};

export default Hunter;

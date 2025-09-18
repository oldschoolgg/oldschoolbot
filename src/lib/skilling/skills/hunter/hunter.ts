import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '../../types.js';
import creatures from './creatures/index.js';

const Hunter = {
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: SkillsEnum.Hunter,
	emoji: Emoji.Hunter,
	name: 'Hunter'
};

export default Hunter;

import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '@/lib/skilling/types.js';
import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';

const Thieving = {
	aliases: ['thieving', 'stealing'],
	id: SkillsEnum.Thieving,
	emoji: Emoji.Thieving,
	name: 'Thieving',
	stealables,
};

export default Thieving;

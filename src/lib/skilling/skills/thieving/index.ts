import { Emoji } from '@oldschoolgg/toolkit/constants';

import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import { defineSkill } from '@/lib/skilling/types.js';

const Thieving = defineSkill({
	aliases: ['thieving', 'stealing'],
	id: 'thieving',
	emoji: Emoji.Thieving,
	name: 'Thieving',
	stealables
});

export default Thieving;

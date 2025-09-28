import { Emoji } from '@oldschoolgg/toolkit';

import { defineSkill } from '@/lib/skilling/types.js';
import mixables from './mixables/index.js';

const Herblore = defineSkill({
	aliases: ['herb', 'herblore'],
	Mixables: mixables,
	id: 'herblore',
	emoji: Emoji.Herblore,
	name: 'Herblore'
});

export default Herblore;

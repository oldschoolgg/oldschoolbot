import { Emoji } from '@oldschoolgg/toolkit/constants';

import { defineSkill } from '@/lib/skilling/types.js';
import { Fletchables } from './fletchables/index.js';

const Fletching = defineSkill({
	aliases: ['fletch', 'fletching'],
	Fletchables,
	id: 'fletching',
	emoji: Emoji.Fletching,
	name: 'Fletching'
});

export default Fletching;

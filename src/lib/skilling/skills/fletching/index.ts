import { Emoji } from '@oldschoolgg/toolkit/constants';

import { SkillsEnum } from '@/lib/skilling/types.js';
import { Fletchables } from './fletchables/index.js';

const Fletching = {
	aliases: ['fletch', 'fletching'],
	Fletchables,
	id: SkillsEnum.Fletching,
	emoji: Emoji.Fletching,
	name: 'Fletching'
};

export default Fletching;

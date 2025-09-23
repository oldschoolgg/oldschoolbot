import { Emoji } from '@oldschoolgg/toolkit/constants';

import { Fletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import { SkillsEnum } from '@/lib/skilling/types.js';

const Fletching = {
	aliases: ['fletch', 'fletching'],
	Fletchables,
	id: SkillsEnum.Fletching,
	emoji: Emoji.Fletching,
	name: 'Fletching'
};

export default Fletching;

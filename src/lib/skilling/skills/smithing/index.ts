import { Emoji } from '@oldschoolgg/toolkit/constants';
import { itemID } from 'oldschooljs';

import { SkillsEnum } from '@/lib/skilling/types.js';
import BlastableBars from './blastables.js';
import Bars from './smeltables.js';
import SmithableItems from './smithables/index.js';

const smithsUniformItems: { [key: number]: number } = {
	[itemID('Smiths tunic')]: 20,
	[itemID('Smiths trousers')]: 20,
	[itemID('Smiths gloves')]: 20,
	[itemID('Smiths boots')]: 20
};

const Smithing = {
	aliases: ['smithing'],
	Bars,
	SmithableItems,
	BlastableBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing,
	name: 'Smithing',
	smithsUniformItems
};

export default Smithing;

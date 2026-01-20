import { Emoji } from '@oldschoolgg/toolkit';
import { type ItemBank, itemID } from 'oldschooljs';

import { defineSkill } from '@/lib/skilling/types.js';
import BlastableBars from './blastables.js';
import Bars from './smeltables.js';
import SmithableItems from './smithables/index.js';

const smithsUniformItems: ItemBank = {
	[itemID('Smiths tunic')]: 20,
	[itemID('Smiths trousers')]: 20,
	[itemID('Smiths gloves')]: 20,
	[itemID('Smiths boots')]: 20
};

const Smithing = defineSkill({
	aliases: ['smithing'],
	Bars,
	SmithableItems,
	BlastableBars,
	id: 'smithing',
	emoji: Emoji.Smithing,
	name: 'Smithing',
	smithsUniformItems
});

export default Smithing;

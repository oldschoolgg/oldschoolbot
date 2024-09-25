import { itemID } from 'oldschooljs';

import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import BlastableBars from './blastables';
import Bars from './smeltables';
import SmithableItems from './smithables';

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

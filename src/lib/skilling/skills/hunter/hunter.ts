import { itemID } from 'oldschooljs/dist/util';
import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import creatures from './creatures';

const hunterOutfit: { [key: number]: number } = {
	[itemID('Guild hunter headwear')]: 0.4,
	[itemID('Guild hunter top')]: 0.8,
	[itemID('Guild hunter legs')]: 0.6,
	[itemID('Guild hunter boots')]: 0.2
};

const Hunter = {
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: SkillsEnum.Hunter,
	emoji: Emoji.Hunter,
	hunterOutfit,
	name: 'Hunter'
};

export default Hunter;

import { SkillsEnum, Craftable } from '../types';
import { Emoji } from '../../constants';
import Birdhouse from './crafting/birdhouse';
import Built from './crafting/built';
import Dragonhide from './crafting/dragonhide';
import Gems from './crafting/gems';
import Glassblowing from './crafting/glassblowing';
import Gold from './crafting/gold';
import Leather from './crafting/leather';
import Misc from './crafting/misc';
import Silver from './crafting/silver';
import Tanning from './crafting/tanning';

const craftables: Craftable[] = [
	...Birdhouse,
	...Built,
	...Dragonhide,
	...Gems,
	...Glassblowing,
	...Gold,
	...Leather,
	...Misc,
	...Silver,
	...Tanning
];

const Crafting = {
	aliases: ['craft', 'crafting'],
	Craftables: craftables,
	id: SkillsEnum.Crafting,
	emoji: Emoji.Crafting
};

export default Crafting;

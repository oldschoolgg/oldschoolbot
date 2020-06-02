import { Skill } from '../types';
import Agility from './agility';
import Cooking from './cooking';
import Crafting from './crafting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Fletching from './fletching';
import Mining from './mining';
import Prayer from './prayer';
import Runecraft from './runecraft';
import Smithing from './smithing';
import Thieving from './thieving';
import Woodcutting from './woodcutting';
import Farming from './farming';

export const Skills: Record<string, Skill> = {
	Crafting,
	Agility,
	Cooking,
	Fishing,
	Mining,
	Smithing,
	Woodcutting,
	Firemaking,
	Prayer,
	Runecraft,
	Fletching,
	Thieving,
	Farming
};

export default Skills;

import { Skill } from '../types';
import Agility from './agility';
import Attack from './combat/attack';
import Defence from './combat/defence';
import Hitpoints from './combat/hitpoints';
import Magic from './combat/magic/magic';
import Ranged from './combat/ranged';
import Strength from './combat/strength';
import Cooking from './cooking';
import Crafting from './crafting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Fletching from './fletching';
import Mining from './mining';
import Prayer from './prayer';
import Runecraft from './runecraft';
import Smithing from './smithing';
import Woodcutting from './woodcutting';

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
	Attack,
	Strength,
	Defence,
	Ranged,
	Magic,
	Hitpoints
};

export default Skills;

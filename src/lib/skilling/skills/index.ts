import { Skill } from '../types';
import Agility from './agility';
import Attack from './combat/attack';
import Defence from './combat/defence';
import Hitpoints from './combat/hitpoints';
import Ranged from './combat/ranged';
import Strength from './combat/strength';
import Construction from './construction';
import Cooking from './cooking';
import Crafting from './crafting';
import Farming from './farming';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Fletching from './fletching';
import Herblore from './herblore/herblore';
import Hunter from './hunter/hunter';
import Magic from './magic';
import Mining from './mining';
import Prayer from './prayer';
import Runecraft from './runecraft';
import Smithing from './smithing';
import Thieving from './thieving';
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
	Thieving,
	Farming,
	Herblore,
	Hunter,
	Construction,
	Attack,
	Strength,
	Defence,
	Ranged,
	Magic,
	Hitpoints
};

export const skillsValues = Object.values(Skills);

export default Skills;

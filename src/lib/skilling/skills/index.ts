import { Emoji } from '../../constants';
import type { Skill } from '../types';
import { SkillsEnum } from '../types';
import Agility from './agility';
import Construction from './construction';
import Cooking from './cooking/cooking';
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
import Woodcutting from './woodcutting/woodcutting';

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
	Magic,
	Hitpoints: {
		aliases: ['hitpoints', 'hp'],
		id: SkillsEnum.Hitpoints,
		emoji: Emoji.Hitpoints,
		name: 'Hitpoints'
	},
	Attack: {
		aliases: ['attack', 'atk'],
		id: SkillsEnum.Attack,
		emoji: Emoji.Attack,
		name: 'Attack'
	},
	Strength: {
		aliases: ['str', 'strength'],
		id: SkillsEnum.Strength,
		emoji: Emoji.Strength,
		name: 'Strength'
	},
	Defence: {
		aliases: ['def', 'defence'],
		id: SkillsEnum.Defence,
		emoji: Emoji.Defence,
		name: 'Defence'
	},
	Ranged: {
		aliases: ['range', 'ranged'],
		id: SkillsEnum.Ranged,
		emoji: Emoji.Ranged,
		name: 'Ranged'
	},
	Slayer: {
		aliases: ['worst skill', 'slayer', 'slay'],
		id: SkillsEnum.Slayer,
		emoji: Emoji.Slayer,
		name: 'Slayer'
	}
};

export default Skills;

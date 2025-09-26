import { Emoji } from '@oldschoolgg/toolkit/constants';

import { skillEmoji } from '@/lib/data/emojis.js';
import type { Skill } from '@/lib/skilling/types.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import Agility from './agility.js';
import { Construction } from './construction/index.js';
import Cooking from './cooking/cooking.js';
import Crafting from './crafting/index.js';
import Farming from './farming/index.js';
import Firemaking from './firemaking.js';
import { Fishing } from './fishing/fishing.js';
import Fletching from './fletching/index.js';
import Herblore from './herblore/herblore.js';
import Hunter from './hunter/hunter.js';
import Magic from './magic/index.js';
import Mining from './mining.js';
import Prayer from './prayer.js';
import Runecraft from './runecraft.js';
import Smithing from './smithing/index.js';
import Thieving from './thieving/index.js';
import Woodcutting from './woodcutting/woodcutting.js';

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
	},
	Dungeoneering: {
		aliases: ['dg', 'dungeoneering'],
		id: SkillsEnum.Dungeoneering,
		emoji: Emoji.Dungeoneering,
		name: 'Dungeoneering'
	},
	Invention: {
		aliases: ['invention', 'inv'],
		id: SkillsEnum.Invention,
		emoji: Emoji.Invention,
		name: 'Invention'
	},
	Divination: {
		aliases: ['divination', 'div'],
		id: SkillsEnum.Divination,
		emoji: skillEmoji.divination,
		name: 'Divination'
	}
};

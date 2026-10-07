import { Emoji } from '@oldschoolgg/toolkit';

import type { Skill } from '@/lib/skilling/types.js';
import Agility from './agility.js';
import { Construction } from './construction/index.js';
import Cooking from './cooking/cooking.js';
import Crafting from './crafting/index.js';
import { Farming } from './farming/index.js';
import Firemaking from './firemaking.js';
import { Fishing } from './fishing/fishing.js';
import Fletching from './fletching/index.js';
import Herblore from './herblore/herblore.js';
import Hunter from './hunter/hunter.js';
import Magic from './magic/index.js';
import Mining from './mining.js';
import Prayer from './prayer.js';
import Runecraft from './runecraft.js';
import Sailing from './sailing/index.js';
import Smithing from './smithing/index.js';
import { Thieving } from './thieving/index.js';
import Woodcutting from './woodcutting/woodcutting.js';

export const Skills: Record<string, Skill> = {
	Crafting,
	Agility,
	Cooking,
	Fishing,
	Sailing,
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
		id: 'hitpoints',
		emoji: Emoji.Hitpoints,
		name: 'Hitpoints'
	},
	Attack: {
		aliases: ['attack', 'atk'],
		id: 'attack',
		emoji: Emoji.Attack,
		name: 'Attack'
	},
	Strength: {
		aliases: ['str', 'strength'],
		id: 'strength',
		emoji: Emoji.Strength,
		name: 'Strength'
	},
	Defence: {
		aliases: ['def', 'defence'],
		id: 'defence',
		emoji: Emoji.Defence,
		name: 'Defence'
	},
	Ranged: {
		aliases: ['range', 'ranged'],
		id: 'ranged',
		emoji: Emoji.Ranged,
		name: 'Ranged'
	},
	Slayer: {
		aliases: ['worst skill', 'slayer', 'slay'],
		id: 'slayer',
		emoji: Emoji.Slayer,
		name: 'Slayer'
	}
};

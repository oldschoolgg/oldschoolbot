import { Collection } from 'discord.js';

import { SkillsEnum } from '../types';
import Cooking from './cooking';
import Mining from './mining';
<<<<<<< HEAD
import Smithing from './smithing/smithing';
=======
import Slayer from './slayer';
import Smithing from './smithing';
>>>>>>> e951724... slayer skill
import Woodcutting from './woodcutting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Agility from './agility';
import Runecraft from './runecraft';
import Crafting from './crafting/crafting';
import Prayer from './prayer';
import Fletching from './fletching/fletching';

export type Skill =
	| typeof Crafting
	| typeof Agility
	| typeof Cooking
	| typeof Fishing
	| typeof Magic
	| typeof Mining
	| typeof Prayer
	| typeof Slayer
	| typeof Strength
	| typeof Smithing
	| typeof Woodcutting
	| typeof Firemaking
	| typeof Runecraft
	| typeof Prayer
	| typeof Fletching;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Crafting, Crafting as Skill],
	[SkillsEnum.Agility, Agility as Skill],
	[SkillsEnum.Cooking, Cooking as Skill],
	[SkillsEnum.Fishing, Fishing as Skill],
	[SkillsEnum.Magic, Magic as Skill],
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Prayer, Prayer as Skill],
	[SkillsEnum.Slayer, Slayer as Skill],
	[SkillsEnum.Strength, Strength as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill],
	[SkillsEnum.Firemaking, Firemaking as Skill],
	[SkillsEnum.Prayer, Prayer as Skill],
	[SkillsEnum.Runecraft, Runecraft as Skill],
	[SkillsEnum.Fletching, Fletching as Skill]
]);

export default Skills;

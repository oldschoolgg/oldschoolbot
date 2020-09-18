import { Collection } from 'discord.js';

import { SkillsEnum } from '../types';
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
import Woodcutting from './woodcutting';

export type Skill =
	| typeof Crafting
	| typeof Agility
	| typeof Cooking
	| typeof Fishing
	| typeof Mining
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
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill],
	[SkillsEnum.Firemaking, Firemaking as Skill],
	[SkillsEnum.Prayer, Prayer as Skill],
	[SkillsEnum.Runecraft, Runecraft as Skill],
	[SkillsEnum.Fletching, Fletching as Skill]
]);

export default Skills;

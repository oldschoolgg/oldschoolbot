import { Collection } from 'discord.js';

import { SkillsEnum } from '../types';
import Cooking from './cooking';
import Mining from './mining';
import Smithing from './smithing/smithing';
import Woodcutting from './woodcutting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Agility from './agility';
import Runecraft from './runecraft';
import Crafting from './crafting';

export type Skill =
	| typeof Crafting
	| typeof Agility
	| typeof Cooking
	| typeof Fishing
	| typeof Mining
	| typeof Smithing
	| typeof Woodcutting
	| typeof Firemaking
	| typeof Runecraft;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Crafting, Crafting as Skill],
	[SkillsEnum.Agility, Agility as Skill],
	[SkillsEnum.Cooking, Cooking as Skill],
	[SkillsEnum.Fishing, Fishing as Skill],
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill],
	[SkillsEnum.Firemaking, Firemaking as Skill],
	[SkillsEnum.Runecraft, Runecraft as Skill]
]);

export default Skills;

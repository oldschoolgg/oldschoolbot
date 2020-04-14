import { Collection } from 'discord.js';

import Cooking from './cooking';
import Mining from './mining';
import Slayer from './slayer';
import Smithing from './smithing';
import Woodcutting from './woodcutting';
import Firemaking from './firemaking';
import Fishing from './fishing';
import Agility from './agility';
import { SkillsEnum } from '../types';
import Runecraft from './runecraft';
import Magic from './magic';
import Prayer from './prayer';
import Strength from './strength';

export type Skill =
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
	| typeof Runecraft;

const Skills: Collection<string, Skill> = new Collection([
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
	[SkillsEnum.Runecraft, Runecraft as Skill]
]);

export default Skills;

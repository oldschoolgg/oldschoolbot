import { Collection } from 'discord.js';

import Mining from './mining';
import Smithing from './smithing';
import Woodcutting from './woodcutting';
import { SkillsEnum } from '../types';
import Firemaking from './firemaking';

export type Skill =
	| typeof Fishing
	| typeof Mining
	| typeof Smithing
	| typeof Woodcutting
	| typeof Firemaking;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Fishing, Fishing as Skill],
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill],
	[SkillsEnum.Firemaking, Firemaking as Skill]
]);

export default Skills;

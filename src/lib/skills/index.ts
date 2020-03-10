import { Collection } from 'discord.js';

import Mining from './mining';
import Smithing from './smithing';
import { SkillsEnum } from '../types';

export type Skill = typeof Mining | typeof Smithing;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill]
]);

export default Skills;

import { Collection } from 'discord.js';

import Mining from './mining';
import Smithing from './smithing';
import Woodcutting from './woodcutting';
import { SkillsEnum } from '../types';

export type Skill = typeof Mining | typeof Smithing | typeof Woodcutting;

const Skills: Collection<string, Skill> = new Collection([
	[SkillsEnum.Mining, Mining as Skill],
	[SkillsEnum.Smithing, Smithing as Skill],
	[SkillsEnum.Woodcutting, Woodcutting as Skill]
]);

export default Skills;

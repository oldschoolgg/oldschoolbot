import { Collection } from 'discord.js';

import Mining from './mining';
import { SkillsEnum } from '../types/index';

export type Skill = typeof Mining;

const Skills: Collection<string, Skill> = new Collection([[SkillsEnum.Mining, Mining]]);

export default Skills;

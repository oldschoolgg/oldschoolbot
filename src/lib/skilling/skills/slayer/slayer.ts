import { SkillsEnum } from '../../types';
import { Emoji } from '../../../constants';
import allTasks from './tasks/index';

const Slayer = {
	aliases: ['slayer'],
	AllTasks: allTasks,
	id: SkillsEnum.Slayer,
	emoji: Emoji.Slayer
};

export default Slayer;

import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Hitpoints = {
	name: 'Hitpoints',
	aliases: ['hp', 'hitpoints', 'health', 'hitpoint'],
	Monsters: killableMonsters,
	id: SkillsEnum.Hitpoints,
	emoji: Emoji.Hitpoints
};

export default Hitpoints;

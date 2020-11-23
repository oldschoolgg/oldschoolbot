import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Strength = {
	name: 'Strength',
	aliases: ['strength', 'str'],
	Monsters: killableMonsters,
	id: SkillsEnum.Strength,
	emoji: Emoji.Strength
};

export default Strength;

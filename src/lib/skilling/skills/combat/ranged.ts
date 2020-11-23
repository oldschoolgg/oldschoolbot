import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Ranged = {
	name: 'Ranged',
	aliases: ['ranged', 'range'],
	Monsters: killableMonsters,
	id: SkillsEnum.Ranged,
	emoji: Emoji.Ranged
};

export default Ranged;

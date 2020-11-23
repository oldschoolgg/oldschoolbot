import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Attack = {
	name: 'Attack',
	aliases: ['attack'],
	Monsters: killableMonsters,
	id: SkillsEnum.Attack,
	emoji: Emoji.Attack
};

export default Attack;

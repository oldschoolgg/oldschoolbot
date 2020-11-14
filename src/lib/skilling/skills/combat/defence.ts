import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Defence = {
	aliases: ['defence'],
	Monsters: killableMonsters,
	id: SkillsEnum.Defence,
	emoji: Emoji.Defence
};

export default Defence;

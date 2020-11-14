import { Emoji } from '../../../constants';
import killableMonsters from '../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../types';

const Magic = {
	aliases: ['magic', 'mage'],
	// Magic spells in here
	Monsters: killableMonsters,
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic
};

export default Magic;

import { Emoji } from '../../../../constants';
import killableMonsters from '../../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../../types';
import castables from './castables';

const Magic = {
	name: 'Magic',
	aliases: ['magic', 'mage'],
	Castables: castables,
	Monsters: killableMonsters,
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic
};

export default Magic;

import { Castable } from '../../../types';
import Standard from './Standard';
import Arceuus from './Arceuus';
import Lunar from './Lunar';
import { Emoji } from '../../../../constants';
import killableMonsters from '../../../../minions/data/killableMonsters';
import { SkillsEnum } from '../../../types';

const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar];

const Magic = {
	aliases: ['magic', 'mage'],
	Castables: castables,
	Monsters: killableMonsters,
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic
};

export default Magic;

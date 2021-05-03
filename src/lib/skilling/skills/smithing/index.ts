import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import Bars from './smeltables';
import SmithableItems from './smithables';
import BlastableBars from './blastables';

const Smithing = {
	aliases: ['smithing'],
	Bars,
	SmithableItems,
	BlastableBars,
	id: SkillsEnum.Smithing,
	emoji: Emoji.Smithing,
	name: 'Smithing'
};

export default Smithing;

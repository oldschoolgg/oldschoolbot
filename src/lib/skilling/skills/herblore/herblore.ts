import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import mixables from './mixables/index';

const Herblore = {
	aliases: ['herb', 'herblore'],
	Mixables: mixables,
	id: SkillsEnum.Herblore,
	emoji: Emoji.Herblore,
	name: 'Herblore'
};

export default Herblore;

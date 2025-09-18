import { Emoji } from '@oldschoolgg/toolkit/constants';
import { SkillsEnum } from '../../types.js';
import mixables from './mixables/index.js';

const Herblore = {
	aliases: ['herb', 'herblore'],
	Mixables: mixables,
	id: SkillsEnum.Herblore,
	emoji: Emoji.Herblore,
	name: 'Herblore'
};

export default Herblore;

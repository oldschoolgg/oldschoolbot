import { SkillsEnum } from '../../types';
import { Emoji } from '../../../constants';
import castables from './castables/index';

const Magic = {
	aliases: ['magic', 'cast'],
	Castables: castables,
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic
};

export default Magic;

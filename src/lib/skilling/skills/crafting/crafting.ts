import { SkillsEnum } from '../../types';
import { Emoji } from '../../../constants';
import craftables from './craftables/index';

const Crafting = {
	aliases: ['craft', 'crafting'],
	Craftables: craftables,
	id: SkillsEnum.Crafting,
	emoji: Emoji.Crafting
};

export default Crafting;

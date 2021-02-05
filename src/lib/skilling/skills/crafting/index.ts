import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import { Craftables } from './craftables/index';

const Crafting = {
	aliases: ['craft', 'crafting'],
	Craftables,
	id: SkillsEnum.Crafting,
	emoji: Emoji.Crafting,
	name: 'Crafting'
};

export default Crafting;

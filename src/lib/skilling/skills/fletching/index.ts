import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import fletchables from './fletchables/index';

const Fletching = {
	aliases: ['fletch', 'fletching'],
	Fletchables: fletchables,
	id: SkillsEnum.Fletching,
	emoji: Emoji.Fletching,
	name: 'Fletching'
};

export default Fletching;

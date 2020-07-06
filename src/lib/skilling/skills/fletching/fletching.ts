import { SkillsEnum } from '../../types';
import { Emoji } from '../../../constants';
import fletchables from './fletchables/index';

const Fletching = {
	aliases: ['fletch', 'fletching'],
	Fletchables: fletchables,
	id: SkillsEnum.Fletching,
	emoji: Emoji.Fletching
};

export default Fletching;

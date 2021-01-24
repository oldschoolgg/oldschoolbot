import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import creatures from './creatures';

const Hunter = {
	aliases: ['hunt', 'hunter'],
	Creatures: creatures,
	id: SkillsEnum.Hunter,
	emoji: Emoji.Hunter,
	name: 'Hunter'
};

export default Hunter;

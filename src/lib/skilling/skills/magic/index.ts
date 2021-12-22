import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import { Bank } from 'oldschooljs';
import Standard from './standard';
import Arceuus from './arceuss';
import Lunar from './lunar';

type EnumKeys = keyof typeof SkillsEnum;
type EnumKeyFields = {[key in EnumKeys]?: number};

export enum MagicTypes {
	"Combat", "Curse", "Enchant", "Alchemy", "Skilling", "Teleport"
}

export interface Castable {
	input: Bank;
	output?: Bank | null;
	name: string;
	alias?: string[];
	ticks: number;
	qpRequired?: number;
	gpCost?: number;
	xp: EnumKeyFields;
	levels: EnumKeyFields;
	category: MagicTypes;
}

export const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar];

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic'
};

export default Magic;

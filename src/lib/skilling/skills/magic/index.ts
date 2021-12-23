import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import { Bank } from 'oldschooljs';
import Standard from './standard';
import Arceuus from './arceuus';
import Lunar from './lunar';

type EnumKeys = keyof typeof SkillsEnum;
type EnumKeyFields = {[key in EnumKeys]?: number};

export enum MagicTypes {
	"Combat", "Curse", "Enchant", "Alchemy", "Skilling", "Teleport", "Reanimation"
}

export interface Castable {
	alias?: string[];
	name: string;
	levels: EnumKeyFields;
	xp: EnumKeyFields;
	input: Bank;
	output?: Bank | null;
	category: MagicTypes;
	ticks: number;
	qpRequired?: number;
	gpCost?: number;
}

export const castables: Castable[] = [...Standard, ...Arceuus, ...Lunar];

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic'
};

export default Magic;

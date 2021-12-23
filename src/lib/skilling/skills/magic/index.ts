import { Emoji } from '../../../constants';
import { SkillsEnum } from '../../types';
import { Bank } from 'oldschooljs';
import Standard from './standard';
import Arceuus from './arceuus';
import Lunar from './lunar';
import Ancients from './ancients';

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

export const Castables: Castable[] = [...Standard, ...Arceuus, ...Lunar, ...Ancients];
export const Spellbooks = { Standard, Lunar, Arceuus, Ancients };

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic'
};

export default Magic;

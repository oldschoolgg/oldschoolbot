import { Bank } from 'oldschooljs';

import { Emoji } from '../../../constants';
import { MagicTypes, SkillsEnum } from '../../types';
import Ancients from './ancients';
import Arceuus from './arceuus';
import Lunar from './lunar';
import Standard from './standard';

type EnumKeys = keyof typeof SkillsEnum;
type EnumKeyFields = { [key in EnumKeys]?: number };

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
	travelTime?: number;
	skillBoosts?: { [key in EnumKeys]?: number[][] };
}

export const Castables: Castable[] = [...Standard, ...Arceuus, ...Lunar, ...Ancients];

const Magic = {
	aliases: ['mage', 'magic'],
	id: SkillsEnum.Magic,
	emoji: Emoji.Magic,
	name: 'Magic'
};

export default Magic;

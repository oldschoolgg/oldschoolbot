import itemID from './util/itemID';
import { SkillsEnum } from './types';

interface Skillcape {
	skill: SkillsEnum;
	hood: number;
	untrimmed: number;
	trimmed: number;
}

const Skillcapes: Skillcape[] = [
	{
		skill: SkillsEnum.Mining,
		hood: itemID('Mining hood'),
		untrimmed: itemID('Mining cape'),
		trimmed: itemID('Mining cape(t)')
	},
	{
		skill: SkillsEnum.Smithing,
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)')
	}
];

export default Skillcapes;

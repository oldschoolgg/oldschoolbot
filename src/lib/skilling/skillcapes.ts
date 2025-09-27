import { itemID } from 'oldschooljs';

import type { SkillNameType } from './types.js';

interface Skillcape {
	skill: SkillNameType;
	hood: number;
	untrimmed: number;
	trimmed: number;
}

const Skillcapes: Skillcape[] = [
	{
		skill: 'mining',
		hood: itemID('Mining hood'),
		untrimmed: itemID('Mining cape'),
		trimmed: itemID('Mining cape(t)')
	},
	{
		skill: 'smithing',
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)')
	},
	{
		skill: 'woodcutting',
		hood: itemID('Woodcutting hood'),
		untrimmed: itemID('Woodcutting cape'),
		trimmed: itemID('Woodcut. cape(t)')
	},
	{
		skill: 'firemaking',
		hood: itemID('Firemaking hood'),
		untrimmed: itemID('Firemaking cape'),
		trimmed: itemID('Firemaking cape(t)')
	},
	{
		skill: 'agility',
		hood: itemID('Agility hood'),
		untrimmed: itemID('Agility cape'),
		trimmed: itemID('Agility cape(t)')
	},
	{
		skill: 'fishing',
		hood: itemID('Fishing hood'),
		untrimmed: itemID('Fishing cape'),
		trimmed: itemID('Fishing cape(t)')
	},
	{
		skill: 'runecraft',
		hood: itemID('Runecraft hood'),
		untrimmed: itemID('Runecraft cape'),
		trimmed: itemID('Runecraft cape(t)')
	},
	{
		skill: 'cooking',
		hood: itemID('Cooking hood'),
		untrimmed: itemID('Cooking cape'),
		trimmed: itemID('Cooking cape(t)')
	},
	{
		skill: 'crafting',
		hood: itemID('Crafting hood'),
		untrimmed: itemID('Crafting cape'),
		trimmed: itemID('Crafting cape(t)')
	},
	{
		skill: 'prayer',
		hood: itemID('Prayer hood'),
		untrimmed: itemID('Prayer cape'),
		trimmed: itemID('Prayer cape(t)')
	},
	{
		skill: 'fletching',
		hood: itemID('Fletching hood'),
		untrimmed: itemID('Fletching cape'),
		trimmed: itemID('Fletching cape(t)')
	},
	{
		skill: 'thieving',
		hood: itemID('Thieving hood'),
		untrimmed: itemID('Thieving cape'),
		trimmed: itemID('Thieving cape(t)')
	},
	{
		skill: 'farming',
		hood: itemID('Farming hood'),
		untrimmed: itemID('Farming cape'),
		trimmed: itemID('Farming cape(t)')
	},
	{
		skill: 'herblore',
		hood: itemID('Herblore hood'),
		untrimmed: itemID('Herblore cape'),
		trimmed: itemID('Herblore cape(t)')
	},
	{
		skill: 'hunter',
		hood: itemID('Hunter hood'),
		untrimmed: itemID('Hunter cape'),
		trimmed: itemID('Hunter cape(t)')
	},
	{
		skill: 'construction',
		hood: itemID('Construct. hood'),
		untrimmed: itemID('Construct. cape'),
		trimmed: itemID('Construct. cape(t)')
	},
	{
		skill: 'magic',
		hood: itemID('Magic hood'),
		untrimmed: itemID('Magic cape'),
		trimmed: itemID('Magic cape(t)')
	},
	{
		skill: 'attack',
		hood: itemID('Attack hood'),
		untrimmed: itemID('Attack cape'),
		trimmed: itemID('Attack cape(t)')
	},
	{
		skill: 'strength',
		hood: itemID('Strength hood'),
		untrimmed: itemID('Strength cape'),
		trimmed: itemID('Strength cape(t)')
	},
	{
		skill: 'defence',
		hood: itemID('Defence hood'),
		untrimmed: itemID('Defence cape'),
		trimmed: itemID('Defence cape(t)')
	},
	{
		skill: 'ranged',
		hood: itemID('Ranging hood'),
		untrimmed: itemID('Ranging cape'),
		trimmed: itemID('Ranging cape(t)')
	},
	{
		skill: 'hitpoints',
		hood: itemID('Hitpoints hood'),
		untrimmed: itemID('Hitpoints cape'),
		trimmed: itemID('Hitpoints cape(t)')
	},
	{
		skill: 'slayer',
		hood: itemID('Slayer hood'),
		untrimmed: itemID('Slayer cape'),
		trimmed: itemID('Slayer cape(t)')
	}
];

export default Skillcapes;

import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const guardiansOfTheRiftCreatables: Createable[] = [
	// Red Recolours
	{
		name: 'Hat of the eye (red)',
		inputItems: new Bank({ 'Hat of the eye': 1, 'Abyssal red dye': 1 }),
		outputItems: new Bank({ 'Hat of the eye (red)': 1 })
	},
	{
		name: 'Revert Hat of the eye (red)',
		inputItems: new Bank({ 'Hat of the eye (red)': 1 }),
		outputItems: new Bank({ 'Hat of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe top of the eye (red)',
		inputItems: new Bank({ 'Robe top of the eye': 1, 'Abyssal red dye': 1 }),
		outputItems: new Bank({ 'Robe top of the eye (red)': 1 })
	},
	{
		name: 'Revert Robe top of the eye (red)',
		inputItems: new Bank({ 'Robe top of the eye (red)': 1 }),
		outputItems: new Bank({ 'Robe top of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe bottoms of the eye (red)',
		inputItems: new Bank({ 'Robe bottoms of the eye': 1, 'Abyssal red dye': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye (red)': 1 })
	},
	{
		name: 'Revert Robe bottoms of the eye (red)',
		inputItems: new Bank({ 'Robe bottoms of the eye (red)': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye': 1 }),
		noCl: true
	},
	// Green Recolours
	{
		name: 'Hat of the eye (green)',
		inputItems: new Bank({ 'Hat of the eye': 1, 'Abyssal green dye': 1 }),
		outputItems: new Bank({ 'Hat of the eye (green)': 1 })
	},
	{
		name: 'Revert Hat of the eye (green)',
		inputItems: new Bank({ 'Hat of the eye (green)': 1 }),
		outputItems: new Bank({ 'Hat of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe top of the eye (green)',
		inputItems: new Bank({ 'Robe top of the eye': 1, 'Abyssal green dye': 1 }),
		outputItems: new Bank({ 'Robe top of the eye (green)': 1 })
	},
	{
		name: 'Revert Robe top of the eye (green)',
		inputItems: new Bank({ 'Robe top of the eye (green)': 1 }),
		outputItems: new Bank({ 'Robe top of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe bottoms of the eye (green)',
		inputItems: new Bank({ 'Robe bottoms of the eye': 1, 'Abyssal green dye': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye (green)': 1 })
	},
	{
		name: 'Revert Robe bottoms of the eye (green)',
		inputItems: new Bank({ 'Robe bottoms of the eye (green)': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye': 1 }),
		noCl: true
	},
	// Blue Recolours
	{
		name: 'Hat of the eye (blue)',
		inputItems: new Bank({ 'Hat of the eye': 1, 'Abyssal blue dye': 1 }),
		outputItems: new Bank({ 'Hat of the eye (blue)': 1 })
	},
	{
		name: 'Revert Hat of the eye (blue)',
		inputItems: new Bank({ 'Hat of the eye (blue)': 1 }),
		outputItems: new Bank({ 'Hat of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe top of the eye (blue)',
		inputItems: new Bank({ 'Robe top of the eye': 1, 'Abyssal blue dye': 1 }),
		outputItems: new Bank({ 'Robe top of the eye (blue)': 1 })
	},
	{
		name: 'Revert Robe top of the eye (blue)',
		inputItems: new Bank({ 'Robe top of the eye (blue)': 1 }),
		outputItems: new Bank({ 'Robe top of the eye': 1 }),
		noCl: true
	},
	{
		name: 'Robe bottoms of the eye (blue)',
		inputItems: new Bank({ 'Robe bottoms of the eye': 1, 'Abyssal blue dye': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye (blue)': 1 })
	},
	{
		name: 'Revert Robe bottoms of the eye (blue)',
		inputItems: new Bank({ 'Robe bottoms of the eye (blue)': 1 }),
		outputItems: new Bank({ 'Robe bottoms of the eye': 1 }),
		noCl: true
	},
	// Dye swaps
	{
		name: 'Abyssal green dye (using Abyssal blue dye)',
		inputItems: new Bank({ 'Abyssal blue dye': 1 }),
		outputItems: new Bank({ 'Abyssal green dye': 1 }),
		noCl: true
	},
	{
		name: 'Abyssal green dye (using Abyssal red dye)',
		inputItems: new Bank({ 'Abyssal red dye': 1 }),
		outputItems: new Bank({ 'Abyssal green dye': 1 }),
		noCl: true
	},
	{
		name: 'Abyssal blue dye (using Abyssal green dye)',
		inputItems: new Bank({ 'Abyssal green dye': 1 }),
		outputItems: new Bank({ 'Abyssal blue dye': 1 }),
		noCl: true
	},
	{
		name: 'Abyssal blue dye (using Abyssal red dye)',
		inputItems: new Bank({ 'Abyssal red dye': 1 }),
		outputItems: new Bank({ 'Abyssal blue dye': 1 }),
		noCl: true
	},
	{
		name: 'Abyssal red dye (using Abyssal green dye)',
		inputItems: new Bank({ 'Abyssal green dye': 1 }),
		outputItems: new Bank({ 'Abyssal red dye': 1 }),
		noCl: true
	},
	{
		name: 'Abyssal red dye (using Abyssal blue dye)',
		inputItems: new Bank({ 'Abyssal blue dye': 1 }),
		outputItems: new Bank({ 'Abyssal red dye': 1 }),
		noCl: true
	}
];

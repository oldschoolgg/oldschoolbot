import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const capeCreatables: Createable[] = [
	{
		name: 'Ardougne max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Ardougne cloak 4': 1
		}),
		outputItems: new Bank({
			'Ardougne max hood': 1,
			'Ardougne max cape': 1
		})
	},
	{
		name: 'Infernal max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Infernal cape': 1
		}),
		outputItems: new Bank({
			'Infernal max hood': 1,
			'Infernal max cape': 1
		})
	},
	{
		name: 'Assembler max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			"Ava's assembler": 1
		}),
		outputItems: new Bank({
			'Assembler max hood': 1,
			'Assembler max cape': 1
		})
	},
	{
		name: 'Imbued guthix max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Imbued guthix cape': 1
		}),
		outputItems: new Bank({
			'Imbued guthix max hood': 1,
			'Imbued guthix max cape': 1
		})
	},
	{
		name: 'Imbued saradomin max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Imbued saradomin cape': 1
		}),
		outputItems: new Bank({
			'Imbued saradomin max hood': 1,
			'Imbued saradomin max cape': 1
		})
	},
	{
		name: 'Imbued zamorak max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Imbued zamorak cape': 1
		}),
		outputItems: new Bank({
			'Imbued zamorak max hood': 1,
			'Imbued zamorak max cape': 1
		})
	},
	{
		name: 'Mythical max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Mythical cape': 1
		}),
		outputItems: new Bank({
			'Mythical max hood': 1,
			'Mythical max cape': 1
		})
	},
	{
		name: 'Fire max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Fire cape': 1
		}),
		outputItems: new Bank({
			'Fire max hood': 1,
			'Fire max cape': 1
		})
	},
	{
		name: 'Masori assembler max cape',
		inputItems: new Bank({
			'Max hood': 1,
			'Max cape': 1,
			'Masori assembler': 1
		}),
		outputItems: new Bank({
			'Masori assembler max cape': 1,
			'Masori assembler max hood': 1
		})
	}
];

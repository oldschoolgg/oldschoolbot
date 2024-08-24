import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const shadesOfMortonCreatables: Createable[] = [
	{
		name: 'Bronze coffin',
		inputItems: new Bank({
			'Bronze locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Bronze coffin': 1 })
	},
	{
		name: 'Steel coffin',
		inputItems: new Bank({
			'Steel locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Steel coffin': 1 })
	},
	{
		name: 'Black coffin',
		inputItems: new Bank({
			'Black locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Black coffin': 1 })
	},
	{
		name: 'Silver coffin',
		inputItems: new Bank({
			'Silver locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Silver coffin': 1 })
	},
	{
		name: 'Gold coffin',
		inputItems: new Bank({
			'Gold locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Gold coffin': 1 })
	}
];

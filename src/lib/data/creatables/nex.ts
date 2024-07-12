import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const nexCreatables: Createable[] = [
	{
		name: 'Ancient godsword',
		inputItems: new Bank({
			'Godsword blade': 1,
			'Ancient hilt': 1
		}),
		outputItems: new Bank({ 'Ancient godsword': 1 })
	},
	{
		name: 'Zaryte crossbow',
		inputItems: new Bank({
			'Armadyl crossbow': 1,
			'Nihil horn': 1,
			'Nihil shard': 250
		}),
		outputItems: new Bank({ 'Zaryte crossbow': 1 })
	}
];

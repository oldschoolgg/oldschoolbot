import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const amrodCreatables: Createable[] = [
	{
		name: 'Revert crystal weapon seed',
		inputItems: new Bank().add('Crystal weapon seed'),
		outputItems: new Bank().add('Crystal shard', 10),
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Revert crystal tool seed',
		inputItems: new Bank().add('Crystal tool seed'),
		outputItems: new Bank().add('Crystal shard', 100),
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Revert enhanced crystal teleport seed',
		inputItems: new Bank().add('Enhanced crystal teleport seed'),
		outputItems: new Bank().add('Crystal shard', 150),
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Revert crystal armour seed',
		inputItems: new Bank().add('Crystal armour seed'),
		outputItems: new Bank().add('Crystal shard', 250),
		QPRequired: 150,
		noCl: true
	},
	{
		name: 'Revert enhanced crystal weapon seed',
		inputItems: new Bank().add('Enhanced crystal weapon seed'),
		outputItems: new Bank().add('Crystal shard', 1500),
		QPRequired: 150,
		noCl: true
	}
];

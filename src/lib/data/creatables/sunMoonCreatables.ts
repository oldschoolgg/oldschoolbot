import { Bank } from 'oldschooljs';

import { Createable } from '../createables';

export const sunMoonCreatables: Createable[] = [
	{
		name: 'Axe handle base',
		inputItems: new Bank().add('Dwarven bar').add('Volcanic shards'),
		outputItems: new Bank().add('Axe handle base')
	},
	{
		name: 'Axe handle',
		inputItems: new Bank()
			.add('Axe handle base')
			.add('Perfect chitin')
			.add('Ent hide', 10)
			.add('Athelas paste', 30),
		outputItems: new Bank().add('Axe handle')
	},
	{
		name: 'Axe of the high sungod (u)',
		inputItems: new Bank().add('Axe handle').add('Sun-god axe head'),
		outputItems: new Bank().add('Axe of the high sungod (u)')
	},
	{
		name: 'Axe of the high sungod',
		inputItems: new Bank().add('Axe of the high sungod (u)').add('Atomic energy', 100_000),
		outputItems: new Bank().add('Axe of the high sungod')
	}
];

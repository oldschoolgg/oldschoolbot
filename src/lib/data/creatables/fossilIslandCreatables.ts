import { Bank } from 'oldschooljs';

import { Createable } from '../createables';

export const fossilIslandCreatables: Createable[] = [
	{
		name: 'Scribbled note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Scribbled note'),
		QPRequired: 3
	},
	{
		name: 'Partial note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Partial note'),
		QPRequired: 3
	},
	{
		name: 'Ancient note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Ancient note'),
		QPRequired: 3
	},
	{
		name: 'Ancient writings',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Ancient writings'),
		QPRequired: 3
	},
	{
		name: 'Experimental note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Experimental note'),
		QPRequired: 3
	},
	{
		name: 'Paragraph of text',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Paragraph of text'),
		QPRequired: 3
	},
	{
		name: 'Musty smelling note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Musty smelling note'),
		QPRequired: 3
	},
	{
		name: 'Hastily scrawled note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Hastily scrawled note'),
		QPRequired: 3
	},
	{
		name: 'Old writing',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Old writing'),
		QPRequired: 3
	},
	{
		name: 'Short note',
		inputItems: new Bank().add('Numulite', 100),
		outputItems: new Bank().add('Short note'),
		QPRequired: 3
	}
];

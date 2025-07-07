import { Bank } from 'oldschooljs';

import type { Createable } from '@/lib/data/createables';
import { MaterialBank } from '@/lib/invention/MaterialBank';

export const necromancyCreatables: Createable[] = [
	{
		name: 'Soul collector (t1)',
		materialCost: new MaterialBank().add('pious', 10_000).add('organic', 10_000),
		inputItems: new Bank()
			.add('Tormented skull')
			.add('Death rune', 100_000)
			.add('Soul rune', 100_000)
			.add('Blood rune', 100_000),
		outputItems: new Bank().add('Soul collector (t1)'),
		requiredSkills: {
			invention: 90,
			crafting: 90,
			runecraft: 90
		}
	},
	{
		name: 'Soul collector (t2)',
		materialCost: new MaterialBank().add('pious', 20_000).add('organic', 20_000),
		inputItems: new Bank()
			.add('Soul collector (t1)')
			.add('Death rune', 100_000)
			.add('Soul rune', 250_000)
			.add('Blood rune', 250_000),
		outputItems: new Bank().add('Soul collector (t2)')
	},
	{
		name: 'Soul collector (t3)',
		materialCost: new MaterialBank().add('pious', 40_000).add('organic', 40_000),
		inputItems: new Bank()
			.add('Soul collector (t2)')
			.add('Death rune', 500_000)
			.add('Soul rune', 500_000)
			.add('Blood rune', 500_000),
		outputItems: new Bank().add('Soul collector (t3)')
	},
	{
		name: 'Soul collector (t4)',
		materialCost: new MaterialBank().add('pious', 60_000).add('organic', 60_000),
		inputItems: new Bank()
			.add('Soul collector (t3)')
			.add('Death rune', 750_000)
			.add('Soul rune', 750_000)
			.add('Blood rune', 750_000),
		outputItems: new Bank().add('Soul collector (t4)')
	},
	{
		name: 'Soul collector (t5)',
		materialCost: new MaterialBank().add('pious', 80_000).add('organic', 80_000),
		inputItems: new Bank()
			.add('Soul collector (t4)')
			.add('Death rune', 1_000_000)
			.add('Soul rune', 1_000_000)
			.add('Blood rune', 1_000_000),
		outputItems: new Bank().add('Soul collector (t5)')
	},
	{
		name: 'Starlight amulet',
		inputItems: new Bank().add('Platinum amulet').add('Lunite', 10),
		outputItems: new Bank().add('Starlight amulet')
	},
	{
		name: 'Pristine starlight amulet',
		inputItems: new Bank().add('Platinum amulet').add('Moonlight essence').add('Lunite', 100),
		outputItems: new Bank().add('Pristine starlight amulet')
	}
];

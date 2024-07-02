import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const Amulets: PoHObject[] = [
	{
		id: 33_419,
		name: "Mounted xeric's talisman",
		slot: 'amulet',
		level: 72,
		itemCost: new Bank()
			.add('Mahogany plank')
			.add('Gold leaf')
			.add("Xeric's talisman (inert)")
			.add('Lizardman fang', 5000)
	},
	{
		id: 33_418,
		name: 'Mounted digsite pendant',
		slot: 'amulet',
		level: 82,
		itemCost: new Bank().add('Mahogany plank').add('Gold leaf').add("Curator's medallion")
	}
];

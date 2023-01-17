import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const AmuletSpace: PoHObject[] = [
	{
		id: 33_419,
		name: "Mounted xeric's talisman",
		slot: 'amulet_space',
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
		slot: 'amulet_space',
		level: 82,
		itemCost: new Bank().add('Mahogany plank').add('Gold leaf').add("Curator's medallion")
	}
];

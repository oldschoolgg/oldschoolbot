import { Bank } from 'oldschooljs';

import type { Buyable } from './buyables';

export const shootingStarsBuyables: Buyable[] = [
	{
		name: 'Celestial ring (uncharged)',
		itemCost: new Bank().add('Stardust', 2000)
	},
	{
		name: 'Star fragment',
		itemCost: new Bank().add('Stardust', 3000)
	},
	{
		name: 'Bag full of gems (Stardust)',
		itemCost: new Bank().add('Stardust', 300),
		outputItems: new Bank().add('Bag full of gems')
	},
	{
		name: 'Soft clay pack',
		itemCost: new Bank().add('Stardust', 150)
	}
];
